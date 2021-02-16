import * as t from "io-ts";
import { Either } from "fp-ts/Either";
import { Schema, Instance } from "@underlay/apg";
export declare type ID = number;
export declare type Schema = Record<string, {
    state: any;
    inputs: Record<string, Schema.Schema>;
    outputs: Record<string, Schema.Schema>;
}>;
export declare type GetState<S extends Schema, K extends keyof S> = S[K]["state"];
export declare type GetInputs<S extends Schema, K extends keyof S> = S[K]["inputs"];
export declare type GetOutputs<S extends Schema, K extends keyof S> = S[K]["outputs"];
export declare type Failure = {
    message: string;
};
export declare type Pipe<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>> = {
    codecs: {
        [i in keyof Inputs]: t.Type<Inputs[i]>;
    };
    validate: (state: State, inputSchemas: Inputs) => Either<Failure, Outputs>;
    evaluate: (state: State, inputSchemas: Inputs, inputInstances: {
        [i in keyof Inputs]: Instance.Instance<Inputs[i]>;
    }, outputSchemas: Outputs) => Promise<Either<Failure, {
        [o in keyof Outputs]: Instance.Instance<Outputs[o]>;
    }>>;
};
export declare type Pipeline<S extends Schema> = {
    [k in keyof S]: Pipe<GetState<S, k>, GetInputs<S, k>, GetOutputs<S, k>>;
};
export declare type Node<S extends Schema, K extends keyof S = keyof S> = {
    id: number;
} & {
    [k in K]: {
        kind: k;
        state: GetState<S, k>;
        inputs: Record<keyof GetInputs<S, k>, null | ID>;
        outputs: Record<keyof GetOutputs<S, k>, Set<ID>>;
    };
}[K];
export declare type Source<S extends Schema, K extends keyof S> = {
    id: ID;
    output: keyof GetOutputs<S, K>;
};
export declare type Target<S extends Schema, K extends keyof S> = {
    id: ID;
    input: keyof GetInputs<S, K>;
};
export declare type Edge<S extends Schema, SK extends keyof S = keyof S, TK extends keyof S = keyof S> = {
    id: ID;
    source: Source<S, SK>;
    target: Target<S, TK>;
};
export declare type Graph<S extends Schema> = {
    nodes: Node<S>[];
    edges: Edge<S>[];
};
