import { Schema, signalInvalidType } from "@underlay/apg";
import { ul } from "@underlay/namespaces";
import * as t from "io-ts";
export const types = {};
export const paths = t.type({ output: t.string });
export function validate(state, inputSchemas) {
    const { key, columns } = state;
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
    return {
        output: { [key]: Schema.product(components) },
    };
}
