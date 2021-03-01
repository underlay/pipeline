import { Instance } from "@underlay/apg";
import { Codec, Instances, Paths, Schemas } from "@underlay/pipeline-codecs";
import * as t from "io-ts";
export declare const filePattern: RegExp;
export declare function validateInputSchemas<Inputs extends Schemas>(codec: Codec<any, Inputs, any>, inputs: Schemas): inputs is Inputs;
export declare function validateInputInstances<Inputs extends Schemas>(inputSchemas: Inputs, inputInstances: Instances): inputInstances is {
    [i in keyof Inputs]: Instance.Instance<Inputs[i]>;
};
export declare function validateInputPaths<Inputs extends Schemas>(codec: Codec<any, Inputs, any>, inputPaths: Paths): inputPaths is Record<keyof Inputs, string>;
export declare function validateOutputPaths<Outputs extends Schemas>(codec: Codec<any, any, Outputs>, outputPaths: Paths): outputPaths is Record<keyof Outputs, string>;
export declare const formatErrors: (errors: t.Errors) => string;
