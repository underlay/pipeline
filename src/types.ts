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
