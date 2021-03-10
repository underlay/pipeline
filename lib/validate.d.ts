import { Schema } from "@underlay/apg";
import { Either } from "fp-ts/Either";
import { Graph } from "./graph.js";
export default function validate(graph: Graph): Either<{
    id: string | null;
    message: string;
}, Record<string, Record<string, Schema.Schema>>>;
