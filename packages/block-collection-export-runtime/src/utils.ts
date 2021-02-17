import * as t from "io-ts"

import { Schema } from "@underlay/apg"
import codec from "@underlay/apg-codec-apg"

export const types: { input: t.Type<Schema.Schema> } = { input: codec }
export const paths = t.type({})
