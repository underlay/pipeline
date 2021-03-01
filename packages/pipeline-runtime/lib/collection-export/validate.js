import codec from "@underlay/pipeline-codecs/lib/collection-export/index.js";
import { readValidateInputs, writeValidateOutputs } from "../validate.js";
readValidateInputs(codec);
writeValidateOutputs({}, {});
