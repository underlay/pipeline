import * as t from "io-ts"

import table from "@underlay/apg-codec-table"

import { Codec } from "../index.js"

// type Table = typeof table extends t.Type<infer T, any, any> ? T : never
type Table = typeof table["_A"]

export type State = t.TypeOf<typeof state>
export type Inputs = {}
export type Outputs = { output: Table }

const state = t.type({
	file: t.union([t.string, t.null]),
	key: t.string,
	header: t.boolean,
	columns: t.array(
		t.union([
			t.null,
			t.type({
				key: t.string,
				nullValue: t.union([t.null, t.string]),
				type: t.union([
					t.type({ kind: t.literal("uri") }),
					t.type({ kind: t.literal("literal"), datatype: t.string }),
				]),
			}),
		])
	),
})

const codec: Codec<State, Inputs, Outputs> = {
	state: state,
	inputs: {},
	outputs: { output: table },
}

export default codec
