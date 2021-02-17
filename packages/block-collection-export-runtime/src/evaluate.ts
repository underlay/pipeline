import {
	readEvaluateInputs,
	writeEvaluateOutputs,
} from "@underlay/pipeline-runtime"

import * as codec from "@underlay/block-collection-export-codec"

import { types, paths } from "./utils.js"

const { state, inputSchemas, inputInstances } = readEvaluateInputs<
	codec.State,
	codec.Inputs,
	codec.Outputs
>(codec.state, types, paths)

writeEvaluateOutputs<codec.Outputs>({}, {}, {}, {})
