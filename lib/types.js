import * as t from "io-ts";
import apg from "@underlay/apg-codec-apg";
export const schema = new t.Type("schema", apg.is, t.success, t.identity);
const graphError = t.type({
    type: t.literal("validate/graph"),
    message: t.string,
});
export function makeGraphError(message) {
    return { type: "validate/graph", message };
}
const nodeError = t.type({
    type: t.literal("validate/node"),
    id: t.string,
    message: t.string,
});
export function makeNodeError(id, message) {
    return { type: "validate/node", id, message };
}
const edgeError = t.type({
    type: t.literal("validate/edge"),
    id: t.string,
    message: t.string,
});
export function makeEdgeError(id, message) {
    return { type: "validate/edge", id, message };
}
const evaluateEventStart = t.type({ event: t.literal("start") });
const evaluateEventResult = t.type({ event: t.literal("result"), id: t.string });
const evaluateEventFailure = t.type({
    event: t.literal("failure"),
    error: t.union([graphError, nodeError, edgeError]),
});
const evaluateEventSuccess = t.type({ event: t.literal("success") });
export const evaluateEvent = t.union([
    evaluateEventStart,
    evaluateEventResult,
    evaluateEventFailure,
    evaluateEventSuccess,
]);
export function makeResultEvent(id) {
    return { event: "result", id };
}
export function makeFailureEvent(error) {
    return { event: "failure", error };
}
export function makeSuccessEvent() {
    return { event: "success" };
}
