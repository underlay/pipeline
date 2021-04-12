import * as t from "io-ts";
import { schema } from "../../types.js";
const state = t.type({
    etag: t.union([t.null, t.string]),
    id: t.union([t.null, t.string]),
    readme: t.string,
});
const block = {
    name: "Collection Export",
    state: state,
    inputs: { input: schema },
    outputs: {},
    initialValue: { id: null, readme: "", etag: null },
    async validate(state, { input }) {
        if (state.id === null) {
            throw new Error("Missing collection export target. Configure the collection export block to point to a collection!");
        }
        return {};
    },
};
export default block;
