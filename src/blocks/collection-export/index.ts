import * as t from "io-ts"
import { Schema } from "@underlay/apg"

import { Block, schema } from "../../types.js"

const state = t.type({
	etag: t.union([t.null, t.string]),
	id: t.union([t.null, t.string]),
	readme: t.string,
})

export type State = t.TypeOf<typeof state>

export type Inputs = { input: Schema.Schema }
export type Outputs = {}

const block: Block<State, Inputs, Outputs> = {
	name: "Collection Export",
	state: state,
	inputs: { input: schema },
	outputs: {},
	initialValue: { id: null, readme: "", etag: null },
	async validate(state, { input }) {
		if (state.id === null) {
			throw new Error(
				"Missing collection export target. Configure the collection export block to point to a collection!"
			)
		}
		return {}
	},
}

export default block
