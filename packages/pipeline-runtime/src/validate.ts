// node ./lib/evaluate.js --state state-file.json --input-schemas foo=bar.schema --output-schemas bar=output.schema

import { readFileSync, writeFileSync } from "fs"

import * as t from "io-ts"
import { Schema } from "@underlay/apg"
import { encode, decode } from "@underlay/apg-format-binary"
import schemaSchema, {
	toSchema,
	fromSchema,
	SchemaSchema,
} from "@underlay/apg-schema-schema"

export interface ValidateFlags<
	State,
	Inputs extends Record<string, Schema.Schema>,
	Outputs extends Record<string, Schema.Schema>
> {
	state: State
	inputSchemas: Inputs
	outputSchemaPaths: Record<keyof Outputs, string>
}

export function readValidateInputs<
	State,
	Inputs extends Record<string, Schema.Schema>,
	Outputs extends Record<string, Schema.Schema>
>(
	codec: t.Type<State>,
	types: { [i in keyof Inputs]: t.Type<Inputs[i]> },
	paths: t.Type<Record<keyof Outputs, string>>
): ValidateFlags<State, Inputs, Outputs> {
	const flags: Record<string, string[]> = {}
	let current: string[] = []
	for (const arg of process.argv.slice(2)) {
		if (arg.startsWith("--")) {
			const flag = arg.slice(2)
			flags[flag] = []
			current = flags[flag]
		} else {
			current.push(arg)
		}
	}

	let state
	const stateValues = flags["state"]
	if (stateValues !== undefined && stateValues.length === 1) {
		const [path] = stateValues
		state = JSON.parse(readFileSync(path, "utf-8"))
	} else {
		throw new Error("Invalid --state flag")
	}

	if (codec.is(state) === false) {
		throw new Error("Invalid state value")
	}

	const filePattern = /^([\w\-\.]+)=([\w\-\.]+)$/

	const inputSchemas: Record<string, Schema.Schema> = {}
	const inputSchemaValues = flags["input-schemas"]
	if (inputSchemaValues !== undefined) {
		for (const value of inputSchemaValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, input, path] = match
				const file = readFileSync(path)
				const instance = decode<SchemaSchema>(schemaSchema, file)
				inputSchemas[input] = toSchema(instance)
			} else {
				throw new Error("Invalid input schema value")
			}
		}
	} else {
		throw new Error("Invalid --input-schemas flag")
	}

	const outputSchemaPaths: Record<string, string> = {}
	const outputSchemaPathValues = flags["output-schemas"]
	if (outputSchemaPathValues !== undefined) {
		for (const value of outputSchemaPathValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, output, path] = match
				outputSchemaPaths[output] = path
			} else {
				throw new Error("Invalid output schema value")
			}
		}
	} else {
		throw new Error("Invalid --output-schemas flag")
	}

	if (validateInputs(types, inputSchemas) && paths.is(outputSchemaPaths)) {
		return {
			state,
			inputSchemas: inputSchemas,
			outputSchemaPaths,
		}
	} else {
		throw new Error("Invalid I/O configuration")
	}
}

const validateInputs = <Inputs extends Record<string, Schema.Schema>>(
	types: { [i in keyof Inputs]: t.Type<Inputs[i]> },
	inputs: Record<string, Schema.Schema>
): inputs is Inputs =>
	Object.keys(types).every((key) => types[key].is(inputs[key]))

export function writeValidateOutputs<
	Outputs extends Record<string, Schema.Schema>
>(outputSchemaPaths: Record<keyof Outputs, string>, outputSchemas: Outputs) {
	for (const key of Object.keys(outputSchemas)) {
		const path = outputSchemaPaths[key]
		const instance = fromSchema(outputSchemas[key])
		const buffer = encode<SchemaSchema>(schemaSchema, instance)
		writeFileSync(path, buffer)
	}
}
