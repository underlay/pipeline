import { Schema, Pipeline, Graph } from "./interfaces.js";
export declare function execute<S extends Schema>(pipeline: Pipeline<S>, graph: Graph<S>): Promise<void>;
