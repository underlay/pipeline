import * as t from "io-ts"
import { Schema } from "@underlay/apg"

import { Block, schema } from "../../types.js"

export type State = {
	host: string
	id: string
}

export type Inputs = { input: Schema.Schema }
export type Outputs = {}

const codec: Block<State, Inputs, Outputs> = {
	state: t.type({ host: t.string, id: t.string }),
	inputs: { input: schema },
	outputs: {},
	validate(state, { input }) {
		return {}
	},
}

export default codec
