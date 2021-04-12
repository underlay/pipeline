import * as t from "io-ts";
import { Schema, Instance } from "@underlay/apg";
export declare type Schemas = Record<string, Schema.Schema>;
export declare type Instances = Record<string, Instance.Instance>;
export declare type Paths = Record<string, string>;
export declare type Codec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>;
export declare type JsonObject = {
    [Key in string]: JsonValue;
};
export interface JsonArray extends Array<JsonValue> {
}
export declare type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface Block<State extends JsonObject, Inputs extends Schemas, Outputs extends Schemas> {
    name: string;
    state: t.Type<State>;
    inputs: {
        [i in keyof Inputs]: Codec<Inputs[i]>;
    };
    outputs: {
        [o in keyof Outputs]: Codec<Outputs[o]>;
    };
    initialValue: State;
    validate: Validate<State, Inputs, Outputs>;
    backgroundColor?: string;
}
export declare const schema: Codec<Schema.Schema>;
export declare type Validate<State extends JsonObject, Inputs extends Schemas, Outputs extends Schemas> = (state: State, inputs: {
    [input in keyof Inputs]: {
        schema: Inputs[input];
    };
}) => Promise<{
    [output in keyof Outputs]: {
        schema: Outputs[output];
    };
}>;
