import { Codec, Schemas } from "@underlay/pipeline-codecs";
export interface ValidateParams<State, Inputs extends Schemas, Outputs extends Schemas> {
    state: State;
    inputSchemaPaths: Record<keyof Inputs, string>;
    inputSchemas: Inputs;
    outputSchemaPaths: Record<keyof Outputs, string>;
}
export declare function readValidateInputs<State, Inputs extends Schemas, Outputs extends Schemas>(codec: Codec<State, Inputs, Outputs>): ValidateParams<State, Inputs, Outputs>;
export declare function writeValidateOutputs<Outputs extends Schemas>(outputSchemaPaths: Record<keyof Outputs, string>, outputSchemas: Outputs): void;
