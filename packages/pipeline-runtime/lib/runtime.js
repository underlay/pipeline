import * as t from "io-ts";
const id = t.type({ id: t.number });
const makeGraphCodec = (pipeline) => t.type({
    nodes: t.array(makeNodeCodec(pipeline)),
    edges: t.array(makeEdgeCodec(pipeline)),
});
function makeNodeCodec(pipeline) {
    const entries = Object.entries(pipeline).map(([kind, { codec }]) => {
        const { state, inputs, outputs } = codec;
        return t.type({ kind: t.literal(kind), state, inputs, outputs });
    });
    if (entries.length > 1) {
        return t.intersection([id, t.union(entries)]);
    }
    else if (entries.length === 1) {
        const [entry] = entries;
        return t.intersection([id, entry]);
    }
    else {
        throw new Error("Empty pipeline schema");
    }
}
const edgeCodec = t.type({
    id: t.number,
    source: t.type({ id: t.number, output: t.string }),
    target: t.type({ id: t.number, input: t.string }),
});
function makeEdgeCodec(pipeline) {
    return edgeCodec;
}
function sort(graph) {
    const edges = new Map(graph.edges.map((edge) => [edge.id, edge]));
    const nodes = graph.nodes.slice().sort((a, b) => {
        for (const key of Object.keys(a.inputs)) {
            const id = a.inputs[key];
            if (id !== null && edges.has(id)) {
                const { source } = edges.get(id);
                if (source.id === b.id && source.output in b.outputs) {
                }
            }
            if (a.inputs[key] !== null) {
            }
            const f = a.inputs[key];
        }
        return 0;
    });
}
const makeAcyclicGraphCodec = (pipeline) => t.brand(makeGraphCodec(pipeline), // a codec representing the type to be refined
(graph) => {
    const nodes = new Map();
    for (const node of graph.nodes) {
        if (nodes.has(node.id)) {
            return false;
        }
        node.inputs;
    }
    return true;
}, // a custom type guard using the build-in helper `Branded`
"Acyclic" // the name must match the readonly field in the brand
);
export async function execute(pipeline, graph) { }
