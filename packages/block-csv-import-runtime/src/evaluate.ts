import { Instance, Schema, signalInvalidType, zip } from "@underlay/apg"

import { OptionalProperty, Property } from "@underlay/apg-codec-table"
import { ul } from "@underlay/namespaces"

import {
	readEvaluateInputs,
	writeEvaluateOutputs,
} from "@underlay/pipeline-runtime"
import * as codec from "@underlay/block-csv-import-codec"
import { encodeLiteral, decodeLiteral } from "@underlay/apg-format-binary"

import { Buffer } from "buffer"
import Papa from "papaparse"

import { types, paths, validate } from "./utils.js"

const {
	state,
	inputSchemas,
	outputSchemaPaths,
	outputInstancePaths,
} = readEvaluateInputs<codec.State, codec.Inputs, codec.Outputs>(
	codec.state,
	types,
	paths
)

const { output } = validate(state, inputSchemas)

const unit = Instance.unit(Schema.unit())

const { file } = state
if (file === null) {
	throw new Error("No file")
}

const product = output[state.key]
if (product === undefined) {
	throw new Error("Invalid class key")
}

const columns: NonNullable<typeof state.columns[number]>[] = []

for (const column of state.columns) {
	if (column === null) {
		throw new Error("Invalid header")
	}
	columns.push(column)
}

const values: Instance.Value<codec.Outputs["output"][string]>[] = []
let skip = state.header

Papa.parse<string[]>(file, {
	skipEmptyLines: true,
	header: false,
	download: true,
	step: ({ errors, data }, parser) => {
		if (errors.length > 0) {
			parser.abort()
			throw new Error(formatErrors(errors))
		}

		for (const row of data) {
			if (row.length !== columns.length) {
				parser.abort()
				throw new Error("Bad row length")
			} else if (skip) {
				skip = false
				continue
			}

			const components: Record<string, Instance.Value<OptionalProperty>> = {}
			for (const [value, { key, nullValue }] of zip(row, columns)) {
				const property = product.components[key]
				if (property.kind === "coproduct") {
					if (value === nullValue) {
						const none = Instance.coproduct(property, ul.none, unit)
						components[key] = none
					} else {
						const type = property.options[ul.some]
						components[key] = Instance.coproduct(
							property,
							ul.some,
							parseProperty(type, value)
						)
					}
				} else {
					components[key] = parseProperty(property, value)
				}
			}
			values.push(
				Instance.product<Record<string, OptionalProperty>>(product, components)
			)
		}
	},
	complete: () => {
		const instance = Instance.instance(output, { [state.key]: values })
		writeEvaluateOutputs<codec.Outputs>(
			outputSchemaPaths,
			{ output },
			outputInstancePaths,
			{ output: instance }
		)
	},
})

function parseProperty(
	type: Property,
	value: string
): Instance.Value<Property> {
	if (type.kind === "uri") {
		return Instance.uri(type, value)
	} else if (type.kind === "literal") {
		const literal = Instance.literal(Schema.literal(type.datatype), value)
		const data = Buffer.concat(Array.from(encodeLiteral(type, literal)))
		const result = decodeLiteral({ data, offset: 0 }, type.datatype)
		return Instance.literal(type, result)
	} else {
		signalInvalidType(type)
	}
}

const formatError = (error: Papa.ParseError) =>
	`${error.type} ${error.code} in row ${error.row}: ${error.message}`

const formatErrors = (errors: Papa.ParseError[]) =>
	errors.map(formatError).join("\n")
