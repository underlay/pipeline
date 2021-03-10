import { Graph } from "../graph.js";
import { EvaluateEventResult, EvaluateEventFailure, EvaluateEventSuccess } from "../types.js";
export default function evaluate(key: string, graph: Graph, directory: string): AsyncGenerator<EvaluateEventResult | EvaluateEventFailure | EvaluateEventSuccess, void, undefined>;
