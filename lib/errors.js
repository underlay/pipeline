import * as t from "io-ts";
export const graphError = t.type({
    type: t.literal("validate/graph"),
    message: t.string,
});
export function makeGraphError(message) {
    return { type: "validate/graph", message };
}
export const nodeError = t.type({
    type: t.literal("validate/node"),
    id: t.string,
    message: t.string,
});
export function makeNodeError(id, message) {
    return { type: "validate/node", id, message };
}
export const edgeError = t.type({
    type: t.literal("validate/edge"),
    id: t.string,
    message: t.string,
});
export function makeEdgeError(id, message) {
    return { type: "validate/edge", id, message };
}
export const validationError = t.union([graphError, nodeError, edgeError]);
