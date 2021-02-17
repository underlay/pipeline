import * as t from "io-ts";
import { Schema } from "@underlay/apg";
export declare type Inputs = {
    input: Schema.Schema;
};
export declare type Outputs = {};
export declare type State = t.TypeOf<typeof state>;
export declare const inputs: t.TypeC<{
    input: t.UnionC<[t.NumberC, t.NullC]>;
}>;
export declare const outputs: t.TypeC<{}>;
export declare const state: t.TypeC<{}>;
