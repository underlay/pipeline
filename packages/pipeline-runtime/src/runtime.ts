import { Schema, Pipeline, Graph } from "./interfaces.js"

import * as t from "io-ts"

export async function execute<S extends Schema>(
	pipeline: Pipeline<S>,
	graph: Graph<S>
): Promise<void> {}
