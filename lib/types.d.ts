import React from "react";
import * as t from "io-ts";
import { Schema, Instance } from "@underlay/apg";
export declare type Schemas = Record<string, Schema.Schema>;
export declare type Instances = Record<string, Instance.Instance>;
export declare type Paths = Record<string, string>;
export declare type SchemaCodec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>;
export interface Block<State, Inputs extends Schemas, Outputs extends Schemas> {
    state: t.Type<State>;
    inputs: {
        [i in keyof Inputs]: SchemaCodec<Inputs[i]>;
    };
    outputs: {
        [o in keyof Outputs]: SchemaCodec<Outputs[o]>;
    };
    validate: Validate<State, Inputs, Outputs>;
}
export declare const schema: SchemaCodec<Schema.Schema>;
export declare type Validate<State, Inputs, Outputs> = (state: State, schemas: Inputs) => Outputs;
export declare type Editor<State> = React.FC<{
    state: State;
    setState: (state: State) => void;
}>;
export declare type Evaluate<State, Inputs extends Schemas, Outputs extends Schemas> = (state: State, schemas: Inputs, instances: {
    [input in keyof Inputs]: Instance.Instance<Inputs[input]>;
}) => Promise<{
    schemas: Outputs;
    instances: {
        [output in keyof Outputs]: Instance.Instance<Outputs[output]>;
    };
}>;
export declare type EvaluateEventStart = t.TypeOf<typeof evaluateEventStart>;
declare const evaluateEventStart: t.TypeC<{
    event: t.LiteralC<"start">;
}>;
export declare type EvaluateEventResult = t.TypeOf<typeof evaluateEventResult>;
declare const evaluateEventResult: t.TypeC<{
    event: t.LiteralC<"result">;
    id: t.StringC;
}>;
export declare type EvaluateEventFailure = t.TypeOf<typeof evaluateEventFailure>;
declare const evaluateEventFailure: t.TypeC<{
    event: t.LiteralC<"failure">;
    error: t.StringC;
    id: t.UnionC<[t.NullC, t.StringC]>;
}>;
export declare type EvaluateEventSuccess = t.TypeOf<typeof evaluateEventSuccess>;
declare const evaluateEventSuccess: t.TypeC<{
    event: t.LiteralC<"success">;
}>;
export declare type EvaluateEvent = t.TypeOf<typeof evaluateEvent>;
export declare const evaluateEvent: t.UnionC<[t.TypeC<{
    event: t.LiteralC<"start">;
}>, t.TypeC<{
    event: t.LiteralC<"result">;
    id: t.StringC;
}>, t.TypeC<{
    event: t.LiteralC<"failure">;
    error: t.StringC;
    id: t.UnionC<[t.NullC, t.StringC]>;
}>, t.TypeC<{
    event: t.LiteralC<"success">;
}>]>;
export declare const makeResultEvent: (id: string) => EvaluateEventResult;
export declare const makeFailureEvent: (id: string | null, error: string) => EvaluateEventFailure;
export declare const makeSuccessEvent: () => EvaluateEventSuccess;
export declare const invalidGraphEvent: EvaluateEventFailure;
export {};
