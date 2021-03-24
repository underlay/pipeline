import { Schema } from "@underlay/apg"
import { left, right, Either } from "fp-ts/Either"

import {
	makeEdgeError,
	makeGraphError,
	makeNodeError,
	Schemas,
	Validate,
	ValidateError,
} from "./types.js"
import { Graph, sortGraph } from "./graph.js"
import { domainEqual } from "./utils.js"

import { blocks, isBlockKind } from "./index.js"

/**
 * Validation is actually a complicated process; it doesn't result in just "success/failure"
 * There are four distinct *classes* of results:
 * 1. validation succeeds and results in a Record<string, Schema> value
 * 2. validation fails because one of the node's async .validate() methods threw an error (a "node error")
 * 3. validation fails because one of the inputs didn't validate its input codec (a "edge error")
 * 4. validation fails because the graph is invalid (a "graph error" due to cycles, broken connections, etc)
 * For most purposes (e.g. a GUI pipeline editor) we actually want to do different things for each case,
 * so the return value of validate() has to distinguish them all. We do this by returning at the top level
 * a Either<ValidateError, Record<string, Schema>> object, where ValidateError is a discriminated union of cases 2/3/4,
 * and Record<string, Schema> is a map from edge IDs to schemas.
 */

type ValidateResult = Either<ValidateError[], Record<string, Schema.Schema>>

export default async function validate(graph: Graph): Promise<ValidateResult> {
	const errors: ValidateError[] = []
	const schemas: Record<string, Schema.Schema> = {}

	const order = sortGraph(graph)
	if (order === null) {
		return left([makeGraphError("Cycle detected")])
	}

	for (const nodeId of order) {
		const node = graph.nodes[nodeId]

		if (!isBlockKind(node.kind)) {
			const message = `Invalid node kind: ${JSON.stringify(node.kind)}`
			errors.push(makeNodeError(nodeId, message))
			continue
		}

		const block = blocks[node.kind]

		if (!block.state.is(node.state)) {
			errors.push(makeNodeError(nodeId, "Invalid state"))
			continue
		} else if (!domainEqual(block.inputs, node.inputs)) {
			errors.push(makeNodeError(nodeId, "Missing or extra inputs"))
			continue
		} else if (!domainEqual(block.outputs, node.outputs)) {
			errors.push(makeNodeError(nodeId, "Missing or extra outputs"))
			continue
		}

		const inputs: Record<string, { schema: Schema.Schema }> = {}
		for (const [input, edgeId] of Object.entries(node.inputs)) {
			// These might not be present if previous nodes failed validation.
			// But it's not an error on this nodes behalf, so we just continue
			if (edgeId in schemas) {
				inputs[input] = { schema: schemas[edgeId] }
			}
		}

		for (const [input, codec] of Object.entries(block.inputs)) {
			if (!codec.is(inputs[input])) {
				const edgeId = node.inputs[input]
				errors.push(makeEdgeError(edgeId, "Input failed validation"))
			}
		}

		// If we're missing any inputs, skip this node
		if (!domainEqual(block.inputs, inputs)) {
			continue
		}

		// TS doesn't know that node.kind and node.state are coordinated,
		// or else this would typecheck without coersion
		const validate = block.validate as Validate<any, Schemas, Schemas>
		await validate(node.state, inputs)
			.then((outputs) => {
				for (const [output, codec] of Object.entries(block.outputs)) {
					if (output in outputs) {
						throw new Error(
							"Node validation did not return all the required outputs"
						)
					} else if (!codec.is(outputs[output])) {
						throw new Error(
							`Node produced an invalid schema for output ${output}`
						)
					} else {
						for (const edgeId of node.outputs[output]) {
							schemas[edgeId] = outputs[output].schema
						}
					}
				}
			})
			.catch((error) => errors.push(makeNodeError(nodeId, error.toString())))
	}

	if (errors.length > 0) {
		return left(errors)
	} else if (domainEqual(graph.edges, schemas)) {
		return right(schemas)
	} else {
		throw new Error("Internal validation error")
	}
}
