import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

import { Schema, Instance, validateInstance } from "@underlay/apg"
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
	Evaluate,
	makeGraphError,
	makeNodeError,
	Schemas,
	makeEdgeError,
} from "../types.js"
import { Blocks, blocks, isBlockKind } from "../blocks/index.js"
import { domainEqual } from "../utils.js"
import { runtimes } from "../blocks/runtimes.js"

export default async function* evaluate(
	directory: string,
	graph: Graph
): AsyncGenerator<
	EvaluateEventResult | EvaluateEventFailure | EvaluateEventSuccess,
	void,
	undefined
> {
	const order = sortGraph(graph)
	if (order === null) {
		const error = makeGraphError("Cycle detected")
		return yield makeFailureEvent(error)
	}

	const schemas: Record<string, Schema.Schema> = {}

	for (const nodeId of order) {
		const node = graph.nodes[nodeId]

		if (!isBlockKind(node.kind)) {
			const message = `Invalid node kind: ${JSON.stringify(node.kind)}`
			const error = makeNodeError(nodeId, message)
			return yield makeFailureEvent(error)
		}

		const block = blocks[node.kind]
		if (!block.state.is(node.state)) {
			const error = makeNodeError(nodeId, "Invalid state")
			return yield makeFailureEvent(error)
		} else if (!domainEqual(block.inputs, node.inputs)) {
			const error = makeNodeError(nodeId, "Missing or extra inputs")
			return yield makeFailureEvent(error)
		} else if (!domainEqual(block.outputs, node.outputs)) {
			const error = makeNodeError(nodeId, "Missing or extra outputs")
			return yield makeFailureEvent(error)
		}

		const inputSchemas: Record<string, Schema.Schema> = {}
		for (const [input, edgeId] of Object.entries(node.inputs)) {
			inputSchemas[input] = schemas[edgeId]
		}

		for (const [input, codec] of Object.entries(block.inputs)) {
			if (!codec.is(inputSchemas[input])) {
				const id = node.inputs[input]
				const error = makeEdgeError(id, "Input failed validation")
				return yield makeFailureEvent(error)
			}
		}

		// This is probably the most likely part of evaluation to fail,
		// adding some kind of error handling here would be smart
		const inputInstances = readInputInstances<keyof Blocks>(
			directory,
			graph,
			nodeId,
			inputSchemas
		)

		// TS doesn't know that node.kind and node.state are coordinated,
		// or else this would typecheck without coersion
		const evaluate = runtimes[node.kind] as Evaluate<any, Schemas, Schemas>

		const event = await evaluate(node.state, inputSchemas, inputInstances)
			.then((result) => {
				for (const [output, codec] of Object.entries(block.outputs)) {
					const schema = result.schemas[output]
					const instance = result.instances[output]
					if (!codec.is(schema)) {
						const message = `Node produced an invalid schema for output ${output}`
						const error = makeNodeError(nodeId, message)
						return makeFailureEvent(error)
					} else if (!validateInstance(schema, instance)) {
						const message = `Node produced an invalid instance for output ${output}`
						const error = makeNodeError(nodeId, message)
						return makeFailureEvent(error)
					} else {
						for (const edgeId of node.outputs[output]) {
							schemas[edgeId] = schema
						}
						writeSchema(directory, { id: nodeId, output }, schema)
						writeInstance(directory, { id: nodeId, output }, schema, instance)
					}
				}
				return makeResultEvent(nodeId)
			})
			.catch((err) => {
				const error = makeNodeError(nodeId, err.toString())
				return makeFailureEvent(error)
			})

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
