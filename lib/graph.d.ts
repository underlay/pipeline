import * as t from "io-ts";
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
