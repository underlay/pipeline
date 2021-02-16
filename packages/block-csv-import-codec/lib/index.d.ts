import * as t from "io-ts";
import table from "@underlay/apg-codec-table";
export declare type Table = typeof table extends t.Type<infer T, any, any> ? T : never;
export declare type Inputs = {};
export declare type Outputs = {
    output: Table;
};
export declare type State = t.TypeOf<typeof state>;
export declare const inputs: t.TypeC<{}>;
export declare const outputs: t.TypeC<{
    output: t.ArrayC<t.NumberC>;
}>;
export declare const state: t.TypeC<{
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
