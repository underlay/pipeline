import * as t from "io-ts";
import { schema } from "../../types.js";
const codec = {
    state: t.type({ host: t.string, id: t.string }),
    inputs: { input: schema },
    outputs: {},
    initialValue: { host: "hello", id: "world" },
    async validate(state, { input }) {
        return {};
    },
};
export default codec;
