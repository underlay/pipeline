import { Instance } from "@underlay/apg";
import { Codec, Schemas } from "@underlay/pipeline-codecs";
export interface EvaluateParams<State, Inputs extends Schemas, Outputs extends Schemas> {
    state: State;
    inputSchemaPaths: Record<keyof Inputs, string>;
    inputSchemas: Inputs;
    inputInstancePaths: Record<keyof Inputs, string>;
    inputInstances: {
        [i in keyof Inputs]: Instance.Instance<Inputs[i]>;
    };
    outputSchemaPaths: Record<keyof Outputs, string>;
    outputInstancePaths: Record<keyof Outputs, string>;
}
export declare function readEvaluateInputs<State, Inputs extends Schemas, Outputs extends Schemas>(codec: Codec<State, Inputs, Outputs>): EvaluateParams<State, Inputs, Outputs>;
export declare function writeEvaluateOutputs<Outputs extends Schemas>(outputSchemaPaths: Record<keyof Outputs, string>, outputSchemas: Outputs, outputInstancePaths: Record<keyof Outputs, string>, outputInstances: {
    [o in keyof Outputs]: Instance.Instance<Outputs[o]>;
}): void;
