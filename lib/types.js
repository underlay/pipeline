import * as t from "io-ts";
import apg from "@underlay/apg-codec-apg";
export const schema = new t.Type("schema", apg.is, t.success, t.identity);
const evaluateEventStart = t.type({ event: t.literal("start") });
const evaluateEventResult = t.type({ event: t.literal("result"), id: t.string });
const evaluateEventFailure = t.type({
    event: t.literal("failure"),
    error: t.string,
    id: t.union([t.null, t.string]),
});
const evaluateEventSuccess = t.type({ event: t.literal("success") });
export const evaluateEvent = t.union([
    evaluateEventStart,
    evaluateEventResult,
    evaluateEventFailure,
    evaluateEventSuccess,
]);
export const makeResultEvent = (id) => ({
    event: "result",
    id,
});
export const makeFailureEvent = (id, error) => ({ event: "failure", id, error });
export const makeSuccessEvent = () => ({
    event: "success",
});
export const invalidGraphEvent = {
    event: "failure",
    error: "Invalid graph",
    id: null,
};
