interface Graph {
    nodes: Record<string, Node>;
    edges: Record<string, Edge>;
}
interface Node {
    inputs: Record<string, string | null>;
    outputs: Record<string, string[]>;
}
interface Edge {
    source: {
        id: string;
        output: string;
    };
    target: {
        id: string;
        input: string;
    };
}
export declare function validateGraphTopology({ nodes, edges }: Graph): boolean;
export {};
