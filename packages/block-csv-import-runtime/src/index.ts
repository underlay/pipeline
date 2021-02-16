import * as t from "io-ts"
import { left, right, Either, isLeft } from "fp-ts/Either"

import { Schema, Instance, signalInvalidType } from "@underlay/apg"
import table, { Property, OptionalProperty } from "@underlay/apg-codec-table"
import { ul } from "@underlay/namespaces"

import { Pipe, Failure } from "@underlay/pipeline-runtime"
import * as codec from "@underlay/block-csv-import-codec"
import { encodeLiteral, decodeLiteral } from "@underlay/apg-format-binary"

import { Buffer } from "buffer"
import Papa from "papaparse"
import zip from "ziterable"

type State = typeof codec extends t.Type<infer T> ? T : never
type Table = typeof table extends t.Type<infer T, any, any> ? T : never

const unit = Instance.unit(Schema.unit())

const pipe: Pipe<State, {}, { output: Table }> = {
	codec,
	types: {},
	validate: (state, {}) => {
		const { key, headers, file } = state
		if (file === null) {
			return left({ message: "No file" })
		}

		const components: Record<string, OptionalProperty> = {}
		for (const header of headers) {
			if (header !== null) {
				const property =
					header.type.kind === "uri"
						? Schema.uri()
						: header.type.kind === "literal"
						? Schema.literal(header.type.datatype)
						: signalInvalidType(header.type)
				if (header.nullValue === null) {
					components[header.key] = property
				} else {
					components[header.key] = Schema.coproduct({
						[ul.none]: Schema.product({}),
						[ul.some]: property,
					})
				}
			}
		}

		return right({ output: { [key]: Schema.product(components) } })
	},
	evaluate: async (state, {}, {}, { output }) => {
		const { file } = state
		if (file === null) {
			return left({ message: "No file" })
		}

		const product = output[state.key]
		if (product === undefined) {
			return left({ message: "Invalid class key" })
		}

		const headers: NonNullable<typeof state.headers[number]>[] = []

		for (const header of state.headers) {
			if (header === null) {
				return left({ message: "Invalid header" })
			}
			headers.push(header)
		}

		return new Promise((resolve) => {
			const values: Instance.Value<Table[string]>[] = []
			Papa.parse<string[]>(file, {
				header: false,
				download: true,
				step: ({ errors, data }, parser) => {
					if (errors.length > 0) {
						parser.abort()
						return resolve(left({ message: formatErrors(errors) }))
					}

					for (const row of data) {
						if (row.length !== headers.length) {
							parser.abort()
							return resolve(left({ message: `` }))
						}

						const components: Record<
							string,
							Instance.Value<OptionalProperty>
						> = {}
						for (const [value, { key, nullValue }] of zip(row, headers)) {
							const property = product.components[key]
							if (property.kind === "coproduct") {
								if (value === nullValue) {
									const none = Instance.coproduct(property, ul.none, unit)
									components[key] = none
								} else {
									const type = property.options[ul.some]
									const result = parsePrimitive(type, value)
									if (isLeft(result)) {
										return result
									} else {
										const some = Instance.coproduct(
											property,
											ul.some,
											result.right
										)
										components[key] = some
									}
								}
							} else {
								const result = parsePrimitive(property, value)
								if (isLeft(result)) {
									return result
								} else {
									components[key] = result.right
								}
							}
						}
						values.push(
							Instance.product<Record<string, OptionalProperty>>(
								product,
								components
							)
						)
					}
				},
				complete: () => {
					const instance = Instance.instance(output, { [state.key]: values })
					resolve(right({ output: instance }))
				},
			})
		})
	},
}

function parsePrimitive(
	type: Property,
	value: string
): Either<Failure, Instance.Value<Property>> {
	if (type.kind === "uri") {
		return right(Instance.uri(type, value))
	} else if (type.kind === "literal") {
		const literal = Instance.literal(Schema.literal(type.datatype), value)
		let result: string
		try {
			const data = Buffer.concat(Array.from(encodeLiteral(type, literal)))
			result = decodeLiteral({ data, offset: 0 }, type.datatype)
		} catch (e) {
			if (e instanceof Error) {
				return left({ message: e.toString() })
			} else {
				throw e
			}
		}
		return right(Instance.literal(type, result))
	} else {
		signalInvalidType(type)
	}
}

const formatError = (error: Papa.ParseError) =>
	`${error.type} ${error.code} in row ${error.row}: ${error.message}`

const formatErrors = (errors: Papa.ParseError[]) =>
	errors.map(formatError).join("\n")

export default pipe
