import * as t from "io-ts";
import fetch from "node-fetch";
import { decode } from "@underlay/apg-format-binary";
import schemaSchema, { toSchema } from "@underlay/apg-schema-schema";
import { schema } from "../../types.js";
const state = t.type({
    url: t.union([t.null, t.string]),
    version: t.union([t.null, t.string]),
});
const block = {
    name: "Collection Import",
    backgroundColor: "lavender",
    state: state,
    inputs: {},
    outputs: { output: schema },
    initialValue: { url: null, version: null },
    async validate({ url, version }, {}) {
        if (url === null || version === null) {
            throw new Error("No collection specified");
        }
        else {
            const schemaUrl = `${url}/${version}/index.schema`;
            const res = await fetch(schemaUrl);
            const data = await res.buffer();
            const instance = decode(schemaSchema, data);
            const schema = toSchema(instance);
            return { output: { schema } };
        }
    },
};
export default block;
