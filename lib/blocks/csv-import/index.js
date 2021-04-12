import * as t from "io-ts";
import { Schema, signalInvalidType } from "@underlay/apg";
import { ul } from "@underlay/namespaces";
import table from "@underlay/apg-codec-table";
const state = t.type({
    uri: t.union([t.null, t.string]),
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
const block = {
    name: "CSV Import",
    backgroundColor: "lavender",
    state: state,
    inputs: {},
    outputs: { output: table },
    initialValue: {
        uri: null,
        key: "",
        header: true,
        columns: [],
    },
    async validate({ uri, key, columns }, {}) {
        if (uri === null) {
            throw new Error("Missing file from CSV import block");
        }
        try {
            new URL(key);
        }
        catch (err) {
            throw new Error("The row class key must be a valid URI");
        }
        const components = {};
        for (const column of columns) {
            if (column !== null) {
                const property = column.type.kind === "uri"
                    ? Schema.uri()
                    : column.type.kind === "literal"
                        ? Schema.literal(column.type.datatype)
                        : signalInvalidType(column.type);
                if (column.nullValue === null) {
                    components[column.key] = property;
                }
                else {
                    components[column.key] = Schema.coproduct({
                        [ul.none]: Schema.product({}),
                        [ul.some]: property,
                    });
                }
            }
        }
        const schema = { [key]: Schema.product(components) };
        return { output: { schema } };
    },
};
export default block;
