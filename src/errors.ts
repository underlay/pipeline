import * as t from "io-ts"

export type GraphError = t.TypeOf<typeof graphError>
export const graphError = t.type({
	type: t.literal("validate/graph"),
	message: t.string,
})

export function makeGraphError(message: string): GraphError {
	return { type: "validate/graph", message }
}

export type NodeError = t.TypeOf<typeof nodeError>
export const nodeError = t.type({
	type: t.literal("validate/node"),
	id: t.string,
	message: t.string,
})

export function makeNodeError(id: string, message: string): NodeError {
	return { type: "validate/node", id, message }
}

export type EdgeError = t.TypeOf<typeof edgeError>
export const edgeError = t.type({
	type: t.literal("validate/edge"),
	id: t.string,
	message: t.string,
})

export function makeEdgeError(id: string, message: string): EdgeError {
	return { type: "validate/edge", id, message }
}

export type ValidationError = GraphError | NodeError | EdgeError
export const validationError = t.union([graphError, nodeError, edgeError])
