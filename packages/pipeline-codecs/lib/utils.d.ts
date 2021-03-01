import * as t from "io-ts";
import { Schema } from "@underlay/apg";
export interface Codec<State, Inputs extends Record<string, Schema.Schema>, Outputs extends Record<string, Schema.Schema>> {
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
