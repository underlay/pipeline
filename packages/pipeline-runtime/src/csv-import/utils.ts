import { Schema, signalInvalidType } from "@underlay/apg"
import { OptionalProperty } from "@underlay/apg-codec-table"

import {
	State,
	Inputs,
	Outputs,
} from "@underlay/pipeline-codecs/lib/csv-import/index.js"

import { ul } from "@underlay/namespaces"

export function validate(state: State, inputSchemas: Inputs): Outputs {
	const { key, columns } = state
	const components: Record<string, OptionalProperty> = {}
	for (const column of columns) {
		if (column !== null) {
			const property =
				column.type.kind === "uri"
					? Schema.uri()
					: column.type.kind === "literal"
					? Schema.literal(column.type.datatype)
					: signalInvalidType(column.type)
			if (column.nullValue === null) {
				components[column.key] = property
			} else {
				components[column.key] = Schema.coproduct({
					[ul.none]: Schema.product({}),
					[ul.some]: property,
				})
			}
		}
	}

	return {
		output: { [key]: Schema.product(components) },
	}
}
