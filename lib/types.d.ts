import React from "react";
import * as t from "io-ts";
import { Schema, Instance } from "@underlay/apg";
export declare type Schemas = Record<string, Schema.Schema>;
export declare type Instances = Record<string, Instance.Instance>;
export declare type Paths = Record<string, string>;
export declare type Codec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>;
export interface Block<State, Inputs extends Schemas, Outputs extends Schemas> {
    state: t.Type<State>;
    inputs: {
        [i in keyof Inputs]: Codec<Inputs[i]>;
    };
    outputs: {
        [o in keyof Outputs]: Codec<Outputs[o]>;
    };
    initialValue: State;
    validate: Validate<State, Inputs, Outputs>;
}
export declare const schema: Codec<Schema.Schema>;
export declare type Validate<State, Inputs extends Schemas, Outputs extends Schemas> = (state: State, schemas: Inputs) => Promise<Outputs>;
export declare type ValidateError = GraphError | NodeError | EdgeError;
export declare type GraphError = t.TypeOf<typeof graphError>;
declare const graphError: t.TypeC<{
    type: t.LiteralC<"validate/graph">;
    message: t.StringC;
}>;
export declare function makeGraphError(message: string): GraphError;
export declare type NodeError = t.TypeOf<typeof nodeError>;
declare const nodeError: t.TypeC<{
    type: t.LiteralC<"validate/node">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeNodeError(id: string, message: string): NodeError;
export declare type EdgeError = t.TypeOf<typeof edgeError>;
declare const edgeError: t.TypeC<{
    type: t.LiteralC<"validate/edge">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeEdgeError(id: string, message: string): EdgeError;
export interface Editor<State> {
    backgroundColor?: React.CSSProperties["color"];
    component: React.FC<{
        state: State;
        setState: (state: State) => void;
    }>;
}
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
    error: t.UnionC<[t.TypeC<{
        type: t.LiteralC<"validate/graph">;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/node">;
        id: t.StringC;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/edge">;
        id: t.StringC;
        message: t.StringC;
    }>]>;
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
    error: t.UnionC<[t.TypeC<{
        type: t.LiteralC<"validate/graph">;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/node">;
        id: t.StringC;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/edge">;
        id: t.StringC;
        message: t.StringC;
    }>]>;
}>, t.TypeC<{
    event: t.LiteralC<"success">;
}>]>;
export declare function makeResultEvent(id: string): EvaluateEventResult;
export declare function makeFailureEvent(error: ValidateError): EvaluateEventFailure;
export declare function makeSuccessEvent(): EvaluateEventSuccess;
export {};
