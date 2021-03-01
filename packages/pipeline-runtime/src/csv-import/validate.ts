import codec, {
	State,
	Inputs,
	Outputs,
} from "@underlay/pipeline-codecs/lib/csv-import/index.js"

import { readValidateInputs, writeValidateOutputs } from "../validate.js"

import { validate } from "./utils.js"

const params = readValidateInputs<State, Inputs, Outputs>(codec)

const { state, inputSchemas, outputSchemaPaths } = params

const outputs = validate(state, inputSchemas)
writeValidateOutputs<Outputs>(outputSchemaPaths, outputs)
