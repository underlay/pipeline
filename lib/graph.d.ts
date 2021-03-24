import * as t from "io-ts";
export declare const node: t.TypeC<{
    kind: t.StringC;
    inputs: t.RecordC<t.StringC, t.StringC>;
    outputs: t.RecordC<t.StringC, t.ArrayC<t.StringC>>;
    state: t.UnknownC;
}>;
export declare type Node = t.TypeOf<typeof node>;
export declare const edge: t.TypeC<{
    source: t.TypeC<{
        id: t.StringC;
        output: t.StringC;
    }>;
    target: t.TypeC<{
        id: t.StringC;
        input: t.StringC;
    }>;
}>;
export declare type Edge = t.TypeOf<typeof edge>;
export declare const baseGraph: t.TypeC<{
    nodes: t.RecordC<t.StringC, t.TypeC<{
        kind: t.StringC;
        inputs: t.RecordC<t.StringC, t.StringC>;
        outputs: t.RecordC<t.StringC, t.ArrayC<t.StringC>>;
        state: t.UnknownC;
    }>>;
    edges: t.RecordC<t.StringC, t.TypeC<{
        source: t.TypeC<{
            id: t.StringC;
            output: t.StringC;
        }>;
        target: t.TypeC<{
            id: t.StringC;
            input: t.StringC;
        }>;
    }>>;
}>;
interface GraphBrand {
    readonly Graph: unique symbol;
}
export declare const Graph: t.BrandC<t.TypeC<{
    nodes: t.RecordC<t.StringC, t.TypeC<{
        kind: t.StringC;
        inputs: t.RecordC<t.StringC, t.StringC>;
        outputs: t.RecordC<t.StringC, t.ArrayC<t.StringC>>;
        state: t.UnknownC;
    }>>;
    edges: t.RecordC<t.StringC, t.TypeC<{
        source: t.TypeC<{
            id: t.StringC;
            output: t.StringC;
        }>;
        target: t.TypeC<{
            id: t.StringC;
            input: t.StringC;
        }>;
    }>>;
}>, GraphBrand>;
export declare type Graph = t.TypeOf<typeof Graph>;
export declare function sortGraph(graph: Graph): null | string[];
export {};
