import * as t from "io-ts";
declare const _default: t.TypeC<{
    file: t.UnionC<[t.StringC, t.NullC]>;
    key: t.StringC;
    headers: t.ArrayC<t.UnionC<[t.NullC, t.TypeC<{
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
export default _default;
