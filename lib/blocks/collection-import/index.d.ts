import * as t from "io-ts";
import { Schema } from "@underlay/apg";
import { Block } from "../../types.js";
declare const state: t.TypeC<{
    url: t.UnionC<[t.NullC, t.StringC]>;
    version: t.UnionC<[t.NullC, t.StringC]>;
}>;
export declare type State = t.TypeOf<typeof state>;
export declare type Inputs = {};
export declare type Outputs = {
    output: Schema.Schema;
};
declare const block: Block<State, Inputs, Outputs>;
export default block;
