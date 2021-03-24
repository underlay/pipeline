import * as t from "io-ts"

import { Schema, Instance } from "@underlay/apg"

import apg from "@underlay/apg-codec-apg"

export type Schemas = Record<string, Schema.Schema>
export type Instances = Record<string, Instance.Instance>
export type Paths = Record<string, string>

export type Codec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>

//https://github.com/sindresorhus/type-fest/
export type JsonObject = { [Key in string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonObject
	| JsonArray

export interface Block<
	State extends JsonObject,
	Inputs extends Schemas,
	Outputs extends Schemas
> {
	name: string
	state: t.Type<State>
	inputs: { [i in keyof Inputs]: Codec<Inputs[i]> }
	outputs: {
		[o in keyof Outputs]: Codec<Outputs[o]>
	}
	initialValue: State
	validate: Validate<State, Inputs, Outputs>
	backgroundColor?: string
}

export const schema: Codec<Schema.Schema> = new t.Type<
	Schema.Schema,
	Schema.Schema,
	Schema.Schema
>("schema", apg.is, t.success, t.identity)

export type Validate<
	State extends JsonObject,
	Inputs extends Schemas,
	Outputs extends Schemas
> = (
	state: State,
	inputs: { [input in keyof Inputs]: { schema: Inputs[input] } }
) => Promise<{ [output in keyof Outputs]: { schema: Outputs[output] } }>

export type ValidateError = GraphError | NodeError | EdgeError

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
