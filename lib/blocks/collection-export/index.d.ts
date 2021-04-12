import * as t from "io-ts";
import { Schema } from "@underlay/apg";
import { Block } from "../../types.js";
declare const state: t.TypeC<{
    etag: t.UnionC<[t.NullC, t.StringC]>;
    id: t.UnionC<[t.NullC, t.StringC]>;
    readme: t.StringC;
}>;
export declare type State = t.TypeOf<typeof state>;
export declare type Inputs = {
    input: Schema.Schema;
};
export declare type Outputs = {};
declare const block: Block<State, Inputs, Outputs>;
export default block;
