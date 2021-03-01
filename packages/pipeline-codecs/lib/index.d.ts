import * as t from "io-ts";
import { Schema, Instance } from "@underlay/apg";
export declare type Schemas = Record<string, Schema.Schema>;
export declare type Instances = Record<string, Instance.Instance>;
export declare type Paths = Record<string, string>;
export interface Codec<State, Inputs extends Schemas, Outputs extends Schemas> {
    state: t.Type<State>;
    inputs: {
        [i in keyof Inputs]: t.Type<Inputs[i], Inputs[i], Schema.Schema>;
    };
    outputs: {
        [o in keyof Outputs]: t.Type<Outputs[o], Outputs[o], Schema.Schema>;
    };
}
export declare const schema: t.Type<Readonly<{
    [x: string]: Schema.Type;
}>, Readonly<{
    [x: string]: Schema.Type;
}>, Readonly<{
    [x: string]: Schema.Type;
}>>;
