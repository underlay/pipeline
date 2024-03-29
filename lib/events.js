import * as t from "io-ts";
import { edgeError, graphError, nodeError } from "./errors.js";
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
export function makeStartEvent() {
    return { event: "start" };
}
export function makeResultEvent(id) {
    return { event: "result", id };
}
export function makeFailureEvent(error) {
    return { event: "failure", error };
}
export function makeSuccessEvent() {
    return { event: "success" };
}
