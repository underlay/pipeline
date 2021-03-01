import * as t from "io-ts"
import { Schema } from "@underlay/apg"

import { Codec, schema } from "../index.js"

export type State = {
	host: string
	id: string
}

export type Inputs = { input: Schema.Schema }
export type Outputs = {}

const codec: Codec<State, Inputs, Outputs> = {
	state: t.type({ host: t.string, id: t.string }),
	inputs: { input: schema },
	outputs: {},
}

export default codec
