import * as t from "io-ts";
export const inputs = t.type({});
export const outputs = t.type({ output: t.array(t.number) });
export const state = t.type({
    file: t.union([t.string, t.null]),
    key: t.string,
    header: t.boolean,
    columns: t.array(t.union([
        t.null,
        t.type({
            key: t.string,
            nullValue: t.union([t.null, t.string]),
            type: t.union([
                t.type({ kind: t.literal("uri") }),
                t.type({ kind: t.literal("literal"), datatype: t.string }),
            ]),
        }),
    ])),
});
