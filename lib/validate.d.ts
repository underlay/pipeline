import { Schema } from "@underlay/apg";
import { Either } from "fp-ts/Either";
import { ValidateError } from "./types.js";
import { Graph } from "./graph.js";
/**
 * Validation is actually a complicated process; it doesn't result in just "success/failure"
 * There are four distinct *classes* of results:
 * 1. validation succeeds and results in a Record<string, Schema> value
 * 2. validation fails because one of the node's async .validate() methods threw an error (a "node error")
 * 3. validation fails because one of the inputs didn't validate its input codec (a "edge error")
 * 4. validation fails because the graph is invalid (a "graph error" due to cycles, broken connections, etc)
 * For most purposes (e.g. a GUI pipeline editor) we actually want to do different things for each case,
 * so the return value of validate() has to distinguish them all. We do this by returning at the top level
 * a Either<ValidateError, Record<string, Schema>> object, where ValidateError is a discriminated union of cases 2/3/4,
 * and Record<string, Schema> is a map from edge IDs to schemas.
 */
declare type ValidateResult = Either<ValidateError[], Record<string, Schema.Schema>>;
export default function validate(graph: Graph): Promise<ValidateResult>;
export {};
