import { left, right } from "fp-ts/Either";
import { makeEdgeError, makeGraphError, makeNodeError, } from "./types.js";
import { sortGraph } from "./graph.js";
import { domainEqual } from "./utils.js";
import { blocks, isBlockKind } from "./blocks/index.js";
export default async function validate(graph) {
    const errors = [];
    const schemas = {};
    const order = sortGraph(graph);
    if (order === null) {
        return left([makeGraphError("Cycle detected")]);
    }
    for (const nodeId of order) {
        const node = graph.nodes[nodeId];
        if (!isBlockKind(node.kind)) {
            const message = `Invalid node kind: ${JSON.stringify(node.kind)}`;
            errors.push(makeNodeError(nodeId, message));
            continue;
        }
        const block = blocks[node.kind];
        if (!block.state.is(node.state)) {
            errors.push(makeNodeError(nodeId, "Invalid state"));
            continue;
        }
        else if (!domainEqual(block.inputs, node.inputs)) {
            errors.push(makeNodeError(nodeId, "Missing or extra inputs"));
            continue;
        }
        else if (!domainEqual(block.outputs, node.outputs)) {
            errors.push(makeNodeError(nodeId, "Missing or extra outputs"));
            continue;
        }
        const inputs = {};
        for (const [input, edgeId] of Object.entries(node.inputs)) {
            // These might not be present if previous nodes failed validation.
            // But it's not an error on this nodes behalf, so we just continue
            if (edgeId in schemas) {
                inputs[input] = schemas[edgeId];
            }
        }
        for (const [input, codec] of Object.entries(block.inputs)) {
            if (input in inputs && !codec.is(inputs[input])) {
                const id = node.inputs[input];
                errors.push(makeEdgeError(id, "Input failed validation"));
            }
        }
        // If we're missing any inputs, skip this node
        if (!domainEqual(block.inputs, inputs)) {
            continue;
        }
        // TS doesn't know that node.kind and node.state are coordinated,
        // or else this would typecheck without coersion
        const validate = block.validate;
        await validate(node.state, inputs)
            .then((outputs) => {
            for (const [output, codec] of Object.entries(block.outputs)) {
                if (!codec.is(outputs[output])) {
                    throw new Error(`Node produced an invalid schema for output ${output}`);
                }
                else {
                    for (const edgeId of node.outputs[output]) {
                        schemas[edgeId] = outputs[output];
                    }
                }
            }
        })
            .catch((error) => errors.push(makeNodeError(nodeId, error.toString())));
    }
    if (errors.length > 0) {
        return left(errors);
    }
    else if (domainEqual(graph.edges, schemas)) {
        return right(schemas);
    }
    else {
        throw new Error("Internal validation error");
    }
}
