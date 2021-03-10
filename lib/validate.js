import { left, right } from "fp-ts/Either";
import { sortGraph } from "./graph.js";
import { domainEqual } from "./utils.js";
import { blocks, isKind } from "./blocks/index.js";
export default function validate(graph) {
    const order = sortGraph(graph);
    if (order === null) {
        return left({ id: null, message: "Cycle detected" });
    }
    const schemas = {};
    for (const id of order) {
        const node = graph.nodes[id];
        if (!isKind(node.kind)) {
            return left({
                id,
                message: `Invalid node kind: ${JSON.stringify(node.kind)}`,
            });
        }
        const codec = blocks[node.kind];
        if (!codec.state.is(node.state)) {
            return left({ id, message: "Invalid state" });
        }
        else if (!domainEqual(codec.inputs, node.inputs)) {
            return left({ id, message: "Missing or extra inputs" });
        }
        else if (!domainEqual(codec.outputs, node.outputs)) {
            return left({ id, message: "Missing or extra outputs" });
        }
        const inputs = {};
        for (const [input, edgeId] of Object.entries(node.inputs)) {
            const { source: { id: sourceId, output }, } = graph.edges[edgeId];
            if (sourceId in schemas && output in schemas[sourceId]) {
                inputs[input] = schemas[sourceId][output];
            }
            else {
                return left({ id: null, message: "Invalid graph" });
            }
        }
        if (!validateInputs(node.kind, inputs)) {
            return left({ id, message: "Input schemas failed validation" });
        }
        const validate = codec.validate;
        schemas[id] = validate(node.state, inputs);
    }
    return right(schemas);
}
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
