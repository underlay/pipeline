import { Schema } from "@underlay/apg"
import { left, right, Either } from "fp-ts/Either"

import { Validate } from "./types.js"
import { Graph, sortGraph } from "./graph.js"
import { domainEqual } from "./utils.js"

import { Blocks, blocks, isKind } from "./blocks/index.js"

export default function validate(
	graph: Graph
): Either<
	{ id: string | null; message: string },
	Record<string, Record<string, Schema.Schema>>
> {
	const order = sortGraph(graph)
	if (order === null) {
		return left({ id: null, message: "Cycle detected" })
	}

	const schemas: Record<string, Record<string, Schema.Schema>> = {}

	for (const id of order) {
		const node = graph.nodes[id]

		if (!isKind(node.kind)) {
			return left({
				id,
				message: `Invalid node kind: ${JSON.stringify(node.kind)}`,
			})
		}

		const codec = blocks[node.kind]
		if (!codec.state.is(node.state)) {
			return left({ id, message: "Invalid state" })
		} else if (!domainEqual(codec.inputs, node.inputs)) {
			return left({ id, message: "Missing or extra inputs" })
		} else if (!domainEqual(codec.outputs, node.outputs)) {
			return left({ id, message: "Missing or extra outputs" })
		}

		const inputs: Record<string, Schema.Schema> = {}
		for (const [input, edgeId] of Object.entries(node.inputs)) {
			const {
				source: { id: sourceId, output },
			} = graph.edges[edgeId]
			if (sourceId in schemas && output in schemas[sourceId]) {
				inputs[input] = schemas[sourceId][output]
			} else {
				return left({ id: null, message: "Invalid graph" })
			}
		}

		if (!validateInputs(node.kind, inputs)) {
			return left({ id, message: "Input schemas failed validation" })
		}

		// We have to do a little type coercion to pivot from
		// Validate<AS, AI, AO> | Evaluate<BS, BI, BO> | ...
		// to
		// Validate<AS | BS | ..., AI | BI | ..., AO | BO | ...>
		// since TS doesn't know that e.g. node.kind and node.state are coordinated.
		type B = Blocks[keyof Blocks]
		const validate = codec.validate as Validate<
			B["state"],
			B["inputs"],
			B["outputs"]
		>

		schemas[id] = validate(node.state, inputs)
	}

	return right(schemas)
}

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
