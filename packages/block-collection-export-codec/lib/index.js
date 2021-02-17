import * as t from "io-ts";
export const inputs = t.type({ input: t.union([t.number, t.null]) });
export const outputs = t.type({});
export const state = t.type({});
