import * as t from "io-ts";
import { Schema, signalInvalidType } from "@underlay/apg";
import { ul } from "@underlay/namespaces";
import table from "@underlay/apg-codec-table";
const state = t.type({
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
const block = {
    name: "CSV Import",
    backgroundColor: "lavender",
    state: state,
    inputs: {},
    outputs: { output: table },
    initialValue: { file: null, key: "", header: true, columns: [] },
    async validate({ key, columns }, {}) {
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
