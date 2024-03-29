import { left, right } from "fp-ts/Either";
import { makeEdgeError, makeGraphError, makeNodeError, } from "./errors.js";
import { sortGraph } from "./graph.js";
import { domainEqual } from "./utils.js";
import { blocks, isBlockKind } from "./index.js";
export async function validate(graph) {
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
                inputs[input] = { schema: schemas[edgeId] };
            }
        }
        for (const [input, codec] of Object.entries(block.inputs)) {
            if (input in inputs && !codec.is(inputs[input].schema)) {
                const edgeId = node.inputs[input];
                errors.push(makeEdgeError(edgeId, "Input failed validation"));
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
                if (!(output in outputs)) {
                    throw new Error("Node validation did not return all the required outputs");
                }
                else if (!codec.is(outputs[output].schema)) {
                    throw new Error(`Node produced an invalid schema for output "${output}"`);
                }
                else {
                    for (const edgeId of node.outputs[output]) {
                        schemas[edgeId] = outputs[output].schema;
                    }
                }
            }
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : error.toString();
            errors.push(makeNodeError(nodeId, message));
        });
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
