// node ./lib/evaluate.js
//    --state state-file.json
//    --input-schemas foo=foo.schema ...
//		--input-instances foo=foo.instance ...
//    --output-schemas bar=bar.schema ...
//    --output-instances bar=bar.instance ...

import { readFileSync, writeFileSync } from "fs"
import { isLeft } from "fp-ts/lib/Either.js"
import { Instance } from "@underlay/apg"
import { encode, decode } from "@underlay/apg-format-binary"
import schemaSchema, {
	toSchema,
	fromSchema,
	SchemaSchema,
} from "@underlay/apg-schema-schema"

import { Codec, Instances, Paths, Schemas } from "@underlay/pipeline-codecs"

import {
	filePattern,
	formatErrors,
	validateInputInstances,
	validateInputPaths,
	validateInputSchemas,
	validateOutputPaths,
} from "./utils.js"

export interface EvaluateParams<
	State,
	Inputs extends Schemas,
	Outputs extends Schemas
> {
	state: State
	inputSchemaPaths: Record<keyof Inputs, string>
	inputSchemas: Inputs
	inputInstancePaths: Record<keyof Inputs, string>
	inputInstances: { [i in keyof Inputs]: Instance.Instance<Inputs[i]> }
	outputSchemaPaths: Record<keyof Outputs, string>
	outputInstancePaths: Record<keyof Outputs, string>
}

export function readEvaluateInputs<
	State,
	Inputs extends Schemas,
	Outputs extends Schemas
>(
	codec: Codec<State, Inputs, Outputs>
): EvaluateParams<State, Inputs, Outputs> {
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
	const result = codec.state.decode(
		JSON.parse(readFileSync(statePath, "utf-8"))
	)
	if (isLeft(result)) {
		throw new Error(`Invalid state value:\n${formatErrors(result.left)}\n`)
	}
	const state = result.right

	const inputSchemaPaths: Paths = {}
	const inputSchemas: Schemas = {}
	const inputSchemaValues = flags["input-schemas"]
	if (inputSchemaValues !== undefined) {
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
	} else {
		throw new Error("Invalid --input-schemas parameter")
	}

	if (!validateInputPaths(codec, inputSchemaPaths)) {
		throw new Error("Invalid input schema paths")
	} else if (!validateInputSchemas<Inputs>(codec, inputSchemas)) {
		throw new Error("Invalid input schemas")
	}

	const inputInstancePaths: Paths = {}
	const inputInstances: Instances = {}
	const inputInstanceValues = flags["input-instances"]
	if (inputInstanceValues !== undefined) {
		for (const value of inputInstanceValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, input, path] = match
				inputInstancePaths[input] = path
				const file = readFileSync(path)
				const instance = decodeInputInstance(inputSchemas, input, file)
				inputInstances[input] = instance
			} else {
				throw new Error("Invalid input schema value")
			}
		}
	} else {
		throw new Error("Invalid --input-schemas parameter")
	}

	if (!validateInputPaths(codec, inputInstancePaths)) {
		throw new Error("Invalid input instance paths")
	} else if (!validateInputInstances(inputSchemas, inputInstances)) {
		throw new Error("Invalid input instances")
	}

	const outputSchemaPaths: Paths = {}
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
		throw new Error("Invalid --output-schemas parameter")
	}

	const outputInstancePaths: Paths = {}
	const outputInstancePathValues = flags["output-instances"]
	if (outputInstancePathValues !== undefined) {
		for (const value of outputInstancePathValues) {
			const match = filePattern.exec(value)
			if (match !== null) {
				const [_, output, path] = match
				outputInstancePaths[output] = path
			} else {
				throw new Error("Invalid output schema value")
			}
		}
	} else {
		throw new Error("Invalid --output-schemas paramter")
	}

	if (!validateOutputPaths(codec, outputSchemaPaths)) {
		throw new Error("Invalid output schema paths")
	} else if (!validateOutputPaths(codec, outputInstancePaths)) {
		throw new Error("Invalid output instance paths")
	} else {
		return {
			state,
			inputSchemaPaths,
			inputSchemas,
			inputInstancePaths,
			inputInstances,
			outputSchemaPaths,
			outputInstancePaths,
		}
	}
}

const decodeInputInstance = <Inputs extends Schemas, Key extends keyof Inputs>(
	inputSchemas: Inputs,
	key: Key,
	file: Buffer
): Instance.Instance<Inputs[Key]> =>
	decode<Inputs[Key]>(inputSchemas[key], file)

export function writeEvaluateOutputs<Outputs extends Schemas>(
	outputSchemaPaths: Record<keyof Outputs, string>,
	outputSchemas: Outputs,
	outputInstancePaths: Record<keyof Outputs, string>,
	outputInstances: { [o in keyof Outputs]: Instance.Instance<Outputs[o]> }
) {
	for (const key of Object.keys(outputSchemas)) {
		const path = outputSchemaPaths[key]
		const instance = fromSchema(outputSchemas[key])
		const buffer = encode<SchemaSchema>(schemaSchema, instance)
		writeFileSync(path, buffer)
	}

	for (const key of Object.keys(outputInstances)) {
		const path = outputInstancePaths[key]
		const buffer = encode(outputSchemas[key], outputInstances[key])
		writeFileSync(path, buffer)
	}
}
