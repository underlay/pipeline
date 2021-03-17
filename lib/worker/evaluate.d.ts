import { Graph } from "../graph.js";
import { EvaluateEventResult, EvaluateEventFailure, EvaluateEventSuccess } from "../types.js";
export default function evaluate(directory: string, graph: Graph): AsyncGenerator<EvaluateEventResult | EvaluateEventFailure | EvaluateEventSuccess, void, undefined>;
