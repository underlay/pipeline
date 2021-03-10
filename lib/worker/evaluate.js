import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { encode, decode } from "@underlay/apg-format-binary";
import schemaSchema, { fromSchema, } from "@underlay/apg-schema-schema";
import { sortGraph } from "../graph.js";
import { makeFailureEvent, makeResultEvent, makeSuccessEvent, invalidGraphEvent, } from "../types.js";
import { blocks, isKind } from "../blocks/index.js";
import { domainEqual } from "../utils.js";
import runtimes from "../blocks/runtimes.js";
export default async function* evaluate(key, graph, directory) {
    const order = sortGraph(graph);
    if (order === null) {
        return yield invalidGraphEvent;
    }
    const schemas = {};
    for (const id of order) {
        const node = graph.nodes[id];
        if (!isKind(node.kind)) {
            return yield makeFailureEvent(id, "Invalid node kind");
        }
        const block = blocks[node.kind];
        if (!block.state.is(node.state)) {
            return yield makeFailureEvent(id, "Invalid node state");
        }
        else if (!domainEqual(block.inputs, node.inputs)) {
            return yield makeFailureEvent(id, "Missing or extra inputs");
        }
        else if (!domainEqual(block.outputs, node.outputs)) {
            return yield makeFailureEvent(id, "Missing or extra outputs");
        }
        const inputSchemas = {};
        for (const [input, edgeId] of Object.entries(node.inputs)) {
            const { source } = graph.edges[edgeId];
            const { id: sourceId, output } = source;
            if (sourceId in schemas && output in schemas[sourceId]) {
                inputSchemas[input] = schemas[sourceId][output];
            }
            else {
                return yield invalidGraphEvent;
            }
        }
        if (!validateInputs(node.kind, inputSchemas)) {
            return yield makeFailureEvent(id, "Input schemas failed validation");
        }
        const inputInstances = readInputInstances(directory, graph, id, inputSchemas);
        const evaluate = runtimes[node.kind];
        const event = await evaluate(node.state, inputSchemas, inputInstances)
            .then((result) => {
            schemas[id] = result.schemas;
            for (const [output, schema] of Object.entries(result.schemas)) {
                writeSchema(directory, { id, output }, schema);
            }
            for (const [output, instance] of Object.entries(result.instances)) {
                const schema = schemas[id][output];
                writeInstance(directory, { id, output }, schema, instance);
            }
            return makeResultEvent(id);
        })
            .catch((err) => makeFailureEvent(id, err.toString()));
        if (event.event === "failure") {
            return yield event;
        }
        else {
            yield event;
        }
    }
    return yield makeSuccessEvent();
}
const getSchemaPath = (directory, source) => resolve(directory, `${source.id}.${source.output}.schema`);
const writeSchema = (directory, source, schema) => writeFileSync(getSchemaPath(directory, source), encode(schemaSchema, fromSchema(schema)));
const getInstancePath = (directory, source) => resolve(directory, `${source.id}.${source.output}.instance`);
const readInstance = (directory, source, schema) => decode(schema, readFileSync(getInstancePath(directory, source)));
const writeInstance = (directory, source, schema, instance) => writeFileSync(getInstancePath(directory, source), encode(schema, instance));
function validateInputs(kind, inputs) {
    for (const [input, codec] of Object.entries(blocks[kind].inputs)) {
        if (input in inputs && codec.is(inputs[input])) {
            continue;
        }
        else {
            return false;
        }
    }
    return true;
}
const readInputInstances = (directory, graph, id, inputSchemas) => Object.fromEntries(Object.entries(inputSchemas).map(([input, schema]) => {
    const edgeId = graph.nodes[id].inputs[input];
    const { source } = graph.edges[edgeId];
    return [input, readInstance(directory, source, schema)];
}));
