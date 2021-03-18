import * as t from "io-ts";
import table from "@underlay/apg-codec-table";
import { Block } from "../../types.js";
declare type Table = typeof table["_A"];
export declare type State = t.TypeOf<typeof state>;
export declare type Inputs = {};
export declare type Outputs = {
    output: Table;
};
declare const state: t.TypeC<{
    file: t.UnionC<[t.StringC, t.NullC]>;
    key: t.StringC;
    header: t.BooleanC;
    columns: t.ArrayC<t.UnionC<[t.NullC, t.TypeC<{
        key: t.StringC;
        nullValue: t.UnionC<[t.NullC, t.StringC]>;
        type: t.UnionC<[t.TypeC<{
            kind: t.LiteralC<"uri">;
        }>, t.TypeC<{
            kind: t.LiteralC<"literal">;
            datatype: t.StringC;
        }>]>;
    }>]>>;
}>;
declare const block: Block<State, Inputs, Outputs>;
export default block;
