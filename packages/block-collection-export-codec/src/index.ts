import * as t from "io-ts"
import { Schema } from "@underlay/apg"

export type Inputs = { input: Schema.Schema }
export type Outputs = {}
export type State = t.TypeOf<typeof state>

export const inputs = t.type({ input: t.union([t.number, t.null]) })
export const outputs = t.type({})
export const state = t.type({})
