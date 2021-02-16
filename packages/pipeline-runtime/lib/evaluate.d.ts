import * as t from "io-ts";
import { Instance, Schema } from "@underlay/apg";
export interface EvaluateFlags<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>> {
    state: State;
    inputSchemas: Inputs;
    inputInstances: {
        [i in keyof Inputs]: Instance.Instance<Inputs[i]>;
    };
    outputSchemaPaths: Record<keyof Outputs, string>;
    outputInstancePaths: Record<keyof Outputs, string>;
}
export declare function readEvaluateInputs<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>>(codec: t.Type<State>, types: {
    [i in keyof Inputs]: t.Type<Inputs[i]>;
}, paths: t.Type<Record<keyof Outputs, string>>): EvaluateFlags<State, Inputs, Outputs>;
export declare function writeEvaluateOutputs<Outputs extends Record<string, Schema.Schema>>(outputSchemaPaths: Record<keyof Outputs, string>, outputSchemas: Outputs, outputInstancePaths: Record<keyof Outputs, string>, outputInstances: {
    [o in keyof Outputs]: Instance.Instance<Outputs[o]>;
}): void;
