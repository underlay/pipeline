import * as t from "io-ts"

import { Schema, Instance } from "@underlay/apg"

import apg from "@underlay/apg-codec-apg"

export type Schemas = Record<string, Schema.Schema>
export type Instances = Record<string, Instance.Instance>
export type Paths = Record<string, string>

export interface Codec<State, Inputs extends Schemas, Outputs extends Schemas> {
	state: t.Type<State>
	inputs: { [i in keyof Inputs]: t.Type<Inputs[i], Inputs[i], Schema.Schema> }
	outputs: {
		[o in keyof Outputs]: t.Type<Outputs[o], Outputs[o], Schema.Schema>
	}
}

export const schema = new t.Type<Schema.Schema, Schema.Schema, Schema.Schema>(
	"schema",
	apg.is,
	(schema, context) => t.success(schema),
	t.identity
)
