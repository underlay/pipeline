import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

import { left, right, Either } from "fp-ts/Either"

import { Schema, Instance } from "@underlay/apg"
import { encode, decode } from "@underlay/apg-format-binary"
import schemaSchema, {
	SchemaSchema,
	fromSchema,
} from "@underlay/apg-schema-schema"

import { Graph, sortGraph } from "../graph.js"
import {
	EvaluateEventResult,
	EvaluateEventFailure,
	EvaluateEventSuccess,
	makeFailureEvent,
	makeResultEvent,
	makeSuccessEvent,
	invalidGraphEvent,
	Evaluate,
} from "../types.js"
import { Blocks, blocks, isKind } from "../blocks/index.js"
import { domainEqual } from "../utils.js"
import runtimes from "../blocks/runtimes.js"

export default async function* evaluate(
	key: string,
	graph: Graph,
	directory: string
): AsyncGenerator<
	EvaluateEventResult | EvaluateEventFailure | EvaluateEventSuccess,
	void,
	undefined
> {
	const order = sortGraph(graph)
	if (order === null) {
		return yield invalidGraphEvent
	}

	const schemas: Record<string, Record<string, Schema.Schema>> = {}

	for (const id of order) {
		const node = graph.nodes[id]

		if (!isKind(node.kind)) {
			return yield makeFailureEvent(id, "Invalid node kind")
		}

		const block = blocks[node.kind]
		if (!block.state.is(node.state)) {
			return yield makeFailureEvent(id, "Invalid node state")
		} else if (!domainEqual(block.inputs, node.inputs)) {
			return yield makeFailureEvent(id, "Missing or extra inputs")
		} else if (!domainEqual(block.outputs, node.outputs)) {
			return yield makeFailureEvent(id, "Missing or extra outputs")
		}

		const inputSchemas: Record<string, Schema.Schema> = {}
		for (const [input, edgeId] of Object.entries(node.inputs)) {
			const { source } = graph.edges[edgeId]
			const { id: sourceId, output } = source
			if (sourceId in schemas && output in schemas[sourceId]) {
				inputSchemas[input] = schemas[sourceId][output]
			} else {
				return yield invalidGraphEvent
			}
		}

		if (!validateInputs(node.kind, inputSchemas)) {
			return yield makeFailureEvent(id, "Input schemas failed validation")
		}

		const inputInstances = readInputInstances<keyof Blocks>(
			directory,
			graph,
			id,
			inputSchemas
		)

		// TS doesn't know that e.g. node.kind and node.state are coordinated,
		// so runtimes[node.kind] expects an *intersection* of all state types.
		// So we have to force-distribute the union from
		// Evaluate<AS, AI, AO> | Evaluate<BS, BI, BO> | ...
		// to
		// Evaluate<AS | BS | ..., AI | BI | ..., AO | BO | ...>
		// This definitely isn't the best overall approach but it works for now.
		type B = Blocks[keyof Blocks]
		const evaluate = runtimes[node.kind] as Evaluate<
			B["state"],
			B["inputs"],
			B["outputs"]
		>

		const event = await evaluate(node.state, inputSchemas, inputInstances)
			.then((result) => {
				schemas[id] = result.schemas
				for (const [output, schema] of Object.entries(result.schemas)) {
					writeSchema(directory, { id, output }, schema)
				}
				for (const [output, instance] of Object.entries(result.instances)) {
					const schema = schemas[id][output]
					writeInstance(directory, { id, output }, schema, instance)
				}
				return makeResultEvent(id)
			})
			.catch((err) => makeFailureEvent(id, err.toString()))

		if (event.event === "failure") {
			return yield event
		} else {
			yield event
		}
	}

	return yield makeSuccessEvent()
}

const getSchemaPath = (
	directory: string,
	source: { id: string; output: string }
) => resolve(directory, `${source.id}.${source.output}.schema`)

const writeSchema = (
	directory: string,
	source: { id: string; output: string },
	schema: Schema.Schema
) =>
	writeFileSync(
		getSchemaPath(directory, source),
		encode<SchemaSchema>(schemaSchema, fromSchema(schema))
	)

const getInstancePath = (
	directory: string,
	source: { id: string; output: string }
) => resolve(directory, `${source.id}.${source.output}.instance`)

const readInstance = <S extends Schema.Schema>(
	directory: string,
	source: { id: string; output: string },
	schema: S
): Instance.Instance<S> =>
	decode<S>(schema, readFileSync(getInstancePath(directory, source)))

const writeInstance = <S extends Schema.Schema>(
	directory: string,
	source: { id: string; output: string },
	schema: S,
	instance: Instance.Instance<S>
) =>
	writeFileSync(getInstancePath(directory, source), encode<S>(schema, instance))

function validateInputs<K extends keyof Blocks>(
	kind: K,
	inputs: Record<string, Schema.Schema>
): inputs is Blocks[K]["inputs"] {
	for (const [input, codec] of Object.entries(blocks[kind].inputs)) {
		if (input in inputs && codec.is(inputs[input])) {
			continue
		} else {
			return false
		}
	}
	return true
}

type InputInstances<Inputs extends Record<string, Schema.Schema>> = {
	[i in keyof Inputs]: Instance.Instance<Inputs[i]>
}

const readInputInstances = <K extends keyof Blocks>(
	directory: string,
	graph: Graph,
	id: string,
	inputSchemas: Blocks[K]["inputs"]
): InputInstances<Blocks[K]["inputs"]> =>
	Object.fromEntries(
		Object.entries(inputSchemas).map(([input, schema]) => {
			const edgeId = graph.nodes[id].inputs[input]
			const { source } = graph.edges[edgeId]
			return [input, readInstance(directory, source, schema)]
		})
	) as InputInstances<Blocks[K]["inputs"]>
