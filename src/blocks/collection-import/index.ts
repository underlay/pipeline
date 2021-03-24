import * as t from "io-ts"
import { Schema } from "@underlay/apg"
import fetch from "node-fetch"

import { decode } from "@underlay/apg-format-binary"
import schemaSchema, { toSchema } from "@underlay/apg-schema-schema"

import { Block, schema } from "../../types.js"

const state = t.type({
	url: t.union([t.null, t.string]),
	version: t.union([t.null, t.string]),
})

export type State = t.TypeOf<typeof state>

export type Inputs = {}
export type Outputs = { output: Schema.Schema }

const block: Block<State, Inputs, Outputs> = {
	name: "Collection Import",
	backgroundColor: "lavender",
	state: state,
	inputs: {},
	outputs: { output: schema },
	initialValue: { url: null, version: null },
	async validate({ url, version }, {}) {
		if (url === null || version === null) {
			throw new Error("No collection specified")
		} else {
			const schemaUrl = `${url}/${version}/index.schema`
			const res = await fetch(schemaUrl)
			const data = await res.buffer()
			const instance = decode(schemaSchema, data)
			const schema = toSchema(instance)
			return { output: { schema } }
		}
	},
}

export default block
