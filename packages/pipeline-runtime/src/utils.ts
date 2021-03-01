import { Instance } from "@underlay/apg"

import { Codec, Instances, Paths, Schemas } from "@underlay/pipeline-codecs"
import { isLeft } from "fp-ts/lib/Either.js"
import * as t from "io-ts"

export const filePattern = /^([\w\-\.\/]+)=([\w\-\.\/]+)$/

export function validateInputSchemas<Inputs extends Schemas>(
	codec: Codec<any, Inputs, any>,
	inputs: Schemas
): inputs is Inputs {
	for (const key of Object.keys(codec.inputs)) {
		const result = codec.inputs[key].decode(inputs[key])
		if (isLeft(result)) {
			throw new Error(
				`Invalid schema for input ${key} ---\n${formatErrors(result.left)}`
			)
		}
	}
	return true
}

export function validateInputInstances<Inputs extends Schemas>(
	inputSchemas: Inputs,
	inputInstances: Instances
): inputInstances is { [i in keyof Inputs]: Instance.Instance<Inputs[i]> } {
	for (const key of Object.keys(inputSchemas)) {
		if (key in inputInstances) {
			continue
		} else {
			throw new Error(`Missing instance for input ${key}`)
		}
	}

	return true
}

export function validateInputPaths<Inputs extends Schemas>(
	codec: Codec<any, Inputs, any>,
	inputPaths: Paths
): inputPaths is Record<keyof Inputs, string> {
	for (const key of Object.keys(codec.inputs)) {
		if (key in inputPaths) {
			continue
		} else {
			throw new Error(`Missing path for input ${key}`)
		}
	}
	return true
}

export function validateOutputPaths<Outputs extends Schemas>(
	codec: Codec<any, any, Outputs>,
	outputPaths: Paths
): outputPaths is Record<keyof Outputs, string> {
	for (const key of Object.keys(codec.outputs)) {
		if (key in outputPaths) {
			continue
		} else {
			throw new Error(`Missing path for output ${key}`)
		}
	}
	return true
}

export const formatErrors = (errors: t.Errors): string =>
	errors.map(formatError).join("\n")

function formatError({ context, message }: t.ValidationError) {
	const [path, name] = context.reduce<[string, string]>(
		([path], { key, type }) => [path + "/" + key, type.name],
		["", ""]
	)

	if (message === undefined) {
		return `${path.slice(1)}: ${name}`
	} else {
		return `${path.slice(1)}: ${name} % ${message}`
	}
}
