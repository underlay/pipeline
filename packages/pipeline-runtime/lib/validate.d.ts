import * as t from "io-ts";
import { Schema } from "@underlay/apg";
export interface ValidateFlags<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>> {
    state: State;
    inputSchemas: Inputs;
    outputSchemaPaths: Record<keyof Outputs, string>;
}
export declare function readValidateInputs<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>>(codec: t.Type<State>, types: {
    [i in keyof Inputs]: t.Type<Inputs[i]>;
}, paths: t.Type<Record<keyof Outputs, string>>): ValidateFlags<State, Inputs, Outputs>;
export declare function writeValidateOutputs<Outputs extends Record<string, Schema.Schema>>(outputSchemaPaths: Record<keyof Outputs, string>, outputSchemas: Outputs): void;
