import codec, {
	State,
	Inputs,
	Outputs,
} from "@underlay/pipeline-codecs/lib/collection-export/index.js"

import { readValidateInputs, writeValidateOutputs } from "../validate.js"

readValidateInputs<State, Inputs, Outputs>(codec)
writeValidateOutputs<Outputs>({}, {})
