import * as t from "io-ts"
import { Schema } from "@underlay/apg"

import { Block, schema } from "../../types.js"

const state = t.type({
	etag: t.union([t.null, t.string]),
	url: t.union([t.null, t.string]),
	readme: t.union([t.null, t.string]),
})

export type State = t.TypeOf<typeof state>

export type Inputs = { input: Schema.Schema }
export type Outputs = {}

const block: Block<State, Inputs, Outputs> = {
	name: "Collection Export",
	state: state,
	inputs: { input: schema },
	outputs: {},
	initialValue: { url: null, readme: null, etag: null },
	async validate(state, { input }) {
		if (state.url === null || state.readme === null) {
			throw new Error("Invalid state")
		}
		return {}
	},
}

export default block
