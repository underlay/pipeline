import * as t from "io-ts";
import { ValidationError } from "./errors.js";
export declare type EvaluateEventStart = t.TypeOf<typeof evaluateEventStart>;
declare const evaluateEventStart: t.TypeC<{
    event: t.LiteralC<"start">;
}>;
export declare type EvaluateEventResult = t.TypeOf<typeof evaluateEventResult>;
declare const evaluateEventResult: t.TypeC<{
    event: t.LiteralC<"result">;
    id: t.StringC;
}>;
export declare type EvaluateEventFailure = t.TypeOf<typeof evaluateEventFailure>;
declare const evaluateEventFailure: t.TypeC<{
    event: t.LiteralC<"failure">;
    error: t.UnionC<[t.TypeC<{
        type: t.LiteralC<"validate/graph">;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/node">;
        id: t.StringC;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/edge">;
        id: t.StringC;
        message: t.StringC;
    }>]>;
}>;
export declare type EvaluateEventSuccess = t.TypeOf<typeof evaluateEventSuccess>;
declare const evaluateEventSuccess: t.TypeC<{
    event: t.LiteralC<"success">;
}>;
export declare type EvaluateEvent = t.TypeOf<typeof evaluateEvent>;
export declare const evaluateEvent: t.UnionC<[t.TypeC<{
    event: t.LiteralC<"start">;
}>, t.TypeC<{
    event: t.LiteralC<"result">;
    id: t.StringC;
}>, t.TypeC<{
    event: t.LiteralC<"failure">;
    error: t.UnionC<[t.TypeC<{
        type: t.LiteralC<"validate/graph">;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/node">;
        id: t.StringC;
        message: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"validate/edge">;
        id: t.StringC;
        message: t.StringC;
    }>]>;
}>, t.TypeC<{
    event: t.LiteralC<"success">;
}>]>;
export declare function makeStartEvent(): EvaluateEventStart;
export declare function makeResultEvent(id: string): EvaluateEventResult;
export declare function makeFailureEvent(error: ValidationError): EvaluateEventFailure;
export declare function makeSuccessEvent(): EvaluateEventSuccess;
export {};
