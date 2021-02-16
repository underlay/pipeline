import { Schema, Pipeline, Graph } from "./interfaces.js"

export async function execute<S extends Schema>(
	pipeline: Pipeline<S>,
	graph: Graph<S>
): Promise<void> {}
