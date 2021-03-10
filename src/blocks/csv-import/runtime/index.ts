import { Buffer } from "buffer"
import Papa from "papaparse"
import fetch from "node-fetch"

import { Instance, Schema, signalInvalidType, zip } from "@underlay/apg"

import { OptionalProperty, Property } from "@underlay/apg-codec-table"
import { ul } from "@underlay/namespaces"

import { encodeLiteral, decodeLiteral } from "@underlay/apg-format-binary"

import block, { State, Inputs, Outputs } from "../index.js"

import { Evaluate } from "../../../types.js"

const unit = Instance.unit(Schema.unit())

// parseProperty validates a literal by serializing it and deserializing it again 🙃
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

const evaluate: Evaluate<State, Inputs, Outputs> = (state, {}, {}) =>
	new Promise((resolve, reject) => {
		const schemas = block.validate(state, {})

		const { file } = state
		if (file === null) {
			throw new Error("No file")
		}

		const product = schemas.output[state.key]
		if (product === undefined) {
			throw new Error("Invalid class key")
		}

		const values: Instance.Value<Outputs["output"][string]>[] = []
		let skip = state.header

		const config = { skipEmptyLines: true, header: false }
		const stream = Papa.parse(Papa.NODE_STREAM_INPUT, config)

		stream.on("data", (row: string[]) => {
			if (row.length !== state.columns.length) {
				stream.end()
				throw new Error("Bad row length")
			} else if (skip) {
				skip = false
				return
			}

			const components: Record<string, Instance.Value<OptionalProperty>> = {}
			for (const [value, column] of zip(row, state.columns)) {
				if (column === null) {
					continue
				}

				const { key, nullValue } = column
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
					try {
						components[key] = parseProperty(property, value)
					} catch (e) {
						stream.end()
						throw e
					}
				}
			}
			values.push(
				Instance.product<Record<string, OptionalProperty>>(product, components)
			)
		})

		stream.on("end", () => {
			const instance = { [state.key]: values }
			const output = Instance.instance(schemas.output, instance)
			resolve({ schemas, instances: { output } })
		})

		stream.on("error", (error) => reject(error))

		fetch(file).then((res) => res.body.pipe(stream))
	})

export default evaluate