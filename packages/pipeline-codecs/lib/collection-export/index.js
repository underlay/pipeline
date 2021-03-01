import * as t from "io-ts";
import { schema } from "../index.js";
const codec = {
    state: t.type({ host: t.string, id: t.string }),
    inputs: { input: schema },
    outputs: {},
};
export default codec;
