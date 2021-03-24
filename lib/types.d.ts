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
export declare type ValidateError = GraphError | NodeError | EdgeError;
export declare type GraphError = t.TypeOf<typeof graphError>;
export declare const graphError: t.TypeC<{
    type: t.LiteralC<"validate/graph">;
    message: t.StringC;
}>;
export declare function makeGraphError(message: string): GraphError;
export declare type NodeError = t.TypeOf<typeof nodeError>;
export declare const nodeError: t.TypeC<{
    type: t.LiteralC<"validate/node">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeNodeError(id: string, message: string): NodeError;
export declare type EdgeError = t.TypeOf<typeof edgeError>;
export declare const edgeError: t.TypeC<{
    type: t.LiteralC<"validate/edge">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeEdgeError(id: string, message: string): EdgeError;
