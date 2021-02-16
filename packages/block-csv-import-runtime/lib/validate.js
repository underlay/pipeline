import { readValidateInputs, writeValidateOutputs, } from "@underlay/pipeline-runtime";
import * as codec from "@underlay/block-csv-import-codec";
import { validate, types, paths } from "./utils.js";
const { state, inputSchemas, outputSchemaPaths } = readValidateInputs(codec.state, types, paths);
writeValidateOutputs(outputSchemaPaths, validate(state, inputSchemas));
