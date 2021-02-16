import * as t from "io-ts"
import { left, right, Either, isLeft } from "fp-ts/Either"

import { Schema, Instance, getKeys } from "@underlay/apg"
import table from "@underlay/apg-codec-table"
import { ul } from "@underlay/namespaces"

import { Pipe, Failure } from "@underlay/pipeline-runtime"
import codec from "@underlay/block-csv-import-codec"
import { encodeLiteral, decodeLiteral } from "@underlay/apg-format-binary"

import { Buffer } from "buffer"
import Papa from "papaparse"
import zip from "ziterable"

type State = typeof codec extends t.Type<infer T> ? T : never
type Table = typeof table extends t.Type<infer T, any, any> ? T : never

function signalInvalidType(type: never): never {
	console.error(type)
	throw new Error("Invalid type")
}

type Property = Table[string]["components"][string]

const unit = Instance.unit()

const pipe: Pipe<State, {}, { output: Table }> = {
	codecs: {},
	validate: (state, {}) => {
		const { key, headers, file } = state
		if (file === null) {
			return left({ message: "No file" })
		}

		const components: Record<string, Property> = {}
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
		const cache = new Map<string, Instance.Uri>()
		for (const header of state.headers) {
			if (header === null) {
				return left({ message: "Invalid header" })
			}
			headers.push(header)
			const { type } = header
			if (type.kind === "literal" && !cache.has(type.datatype)) {
				cache.set(type.datatype, Instance.uri(type.datatype))
			}
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

						const components: Record<string, Instance.Value<Property>> = {}
						for (const [value, { key, nullValue }] of zip(row, headers)) {
							const property = product.components[key]

							if (property.type === "coproduct") {
								const keys = getKeys(property.options)
								if (value === nullValue) {
									const none = Instance.coproduct(keys, ul.none, unit)
									components[key] = none
								} else {
									const type = property.options[ul.some]
									const result = parseLiteral(cache, type, value)
									if (isLeft(result)) {
										return result
									} else {
										const some = Instance.coproduct(keys, ul.some, result.right)
										components[key] = some
									}
								}
							} else {
								const result = parseLiteral(cache, property, value)
								if (isLeft(result)) {
									return result
								} else {
									components[key] = result.right
								}
							}
						}
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

function parseLiteral(
	cache: Map<string, Instance.Uri>,
	type: Schema.Uri | Schema.Literal,
	value: string
): Either<Failure, Instance.Literal | Instance.Uri> {
	if (type.type === "uri") {
		if (cache.has(value)) {
			return right(cache.get(value)!)
		} else {
			const uri = Instance.uri(value)
			cache.set(value, uri)
			return right(uri)
		}
	} else if (type.type === "literal") {
		const literal = Instance.literal(value, Instance.uri(type.datatype))
		let result: string
		try {
			const data = Buffer.concat(Array.from(encodeLiteral(literal)))
			result = decodeLiteral({ data, offset: 0 }, type.datatype)
		} catch (e) {
			if (e instanceof Error) {
				return left({ message: e.toString() })
			} else {
				throw e
			}
		}
		const datatype = cache.get(type.datatype)!
		return right(Instance.literal(result, datatype))
	} else {
		signalInvalidType(type)
	}
}

const formatError = (error: Papa.ParseError) =>
	`${error.type} ${error.code} in row ${error.row}: ${error.message}`

const formatErrors = (errors: Papa.ParseError[]) =>
	errors.map(formatError).join("\n")

export default pipe
