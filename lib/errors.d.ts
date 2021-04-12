import * as t from "io-ts";
export declare type GraphError = t.TypeOf<typeof graphError>;
export declare const graphError: t.TypeC<{
    type: t.LiteralC<"validate/graph">;
    message: t.StringC;
}>;
export declare function makeGraphError(message: string): GraphError;
export declare type NodeError = t.TypeOf<typeof nodeError>;
export declare const nodeError: t.TypeC<{
    type: t.LiteralC<"validate/node">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeNodeError(id: string, message: string): NodeError;
export declare type EdgeError = t.TypeOf<typeof edgeError>;
export declare const edgeError: t.TypeC<{
    type: t.LiteralC<"validate/edge">;
    id: t.StringC;
    message: t.StringC;
}>;
export declare function makeEdgeError(id: string, message: string): EdgeError;
export declare type ValidationError = GraphError | NodeError | EdgeError;
export declare const validationError: t.UnionC<[t.TypeC<{
    type: t.LiteralC<"validate/graph">;
    message: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"validate/node">;
    id: t.StringC;
    message: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"validate/edge">;
    id: t.StringC;
    message: t.StringC;
}>]>;
