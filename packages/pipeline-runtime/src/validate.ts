// node ./lib/validate.js
//	--state state-file.json
//	--input-schemas foo=bar.schema ...
//	--output-schemas bar=output.schema ...

import { readFileSync, writeFileSync } from "fs"
import { isLeft } from "fp-ts/lib/Either.js"
import { Schema } from "@underlay/apg"
import { encode, decode } from "@underlay/apg-format-binary"
import schemaSchema, {
	toSchema,
	fromSchema,
	SchemaSchema,
} from "@underlay/apg-schema-schema"

import { Codec, Paths, Schemas } from "@underlay/pipeline-codecs"

import {
	filePattern,
	formatErrors,
	validateInputPaths,
	validateInputSchemas,
	validateOutputPaths,
} from "./utils.js"

export interface ValidateParams<
	State,
	Inputs extends Schemas,
	Outputs extends Schemas
> {
	state: State
	inputSchemaPaths: Record<keyof Inputs, string>
	inputSchemas: Inputs
	outputSchemaPaths: Record<keyof Outputs, string>
}

export function readValidateInputs<
	State,
	Inputs extends Schemas,
	Outputs extends Schemas
>(
	codec: Codec<State, Inputs, Outputs>
): ValidateParams<State, Inputs, Outputs> {
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

	const stateValues = flags["state"]
	if (stateValues === undefined || stateValues.length !== 1) {
		throw new Error("Invalid --state parameter")
	}

	const [statePath] = stateValues
	const stateResult = codec.state.decode(
		JSON.parse(readFileSync(statePath, "utf-8"))
	)

	if (isLeft(stateResult)) {
		throw new Error(`Invalid state value:\n${formatErrors(stateResult.left)}\n`)
	}

	const state = stateResult.right

	const inputSchemaPaths: Paths = {}
	const inputSchemas: Record<string, Schema.Schema> = {}
	const inputSchemaValues = flags["input-schemas"]
	if (inputSchemaValues === undefined) {
		throw new Error("Missing --input-schemas parameter")
	} else if (inputSchemaValues !== undefined) {
		for (const value of inputSchemaValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, input, path] = match
				inputSchemaPaths[input] = path
				const file = readFileSync(path)
				const instance = decode<SchemaSchema>(schemaSchema, file)
				inputSchemas[input] = toSchema(instance)
			} else {
				throw new Error("Invalid input schema value")
			}
		}
	}

	if (!validateInputPaths(codec, inputSchemaPaths)) {
		throw new Error("Invalid input schema paths")
	} else if (!validateInputSchemas(codec, inputSchemas)) {
		throw new Error("Invalid input schemas")
	}

	const outputSchemaPaths: Record<string, string> = {}
	const outputSchemaPathValues = flags["output-schemas"]
	if (outputSchemaPathValues === undefined) {
		throw new Error("Invalid --output-schemas parameter")
	} else {
		for (const value of outputSchemaPathValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, output, path] = match
				outputSchemaPaths[output] = path
			} else {
				throw new Error("Invalid output schema value")
			}
		}
	}

	if (!validateOutputPaths(codec, outputSchemaPaths)) {
		throw new Error("Invalid output schema paths")
	} else {
		return { state, inputSchemaPaths, inputSchemas, outputSchemaPaths }
	}
}

export function writeValidateOutputs<Outputs extends Schemas>(
	outputSchemaPaths: Record<keyof Outputs, string>,
	outputSchemas: Outputs
) {
	for (const key of Object.keys(outputSchemas)) {
		const path = outputSchemaPaths[key]
		const instance = fromSchema(outputSchemas[key])
		const buffer = encode<SchemaSchema>(schemaSchema, instance)
		writeFileSync(path, buffer)
	}
}
