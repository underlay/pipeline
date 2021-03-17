import { Block } from "../types.js";
export declare const blocks: {
    "csv-import": Block<{
        file: string | null;
        key: string;
        header: boolean;
        columns: ({
            key: string;
            nullValue: string | null;
            type: {
                kind: "uri";
            } | {
                kind: "literal";
                datatype: string;
            };
        } | null)[];
    }, import("./csv-import/index.js").Inputs, import("./csv-import/index.js").Outputs>;
    "collection-export": Block<import("./collection-export/index.js").State, import("./collection-export/index.js").Inputs, import("./collection-export/index.js").Outputs>;
};
export declare const isBlockKind: (key: string) => key is "csv-import" | "collection-export";
export declare type Blocks = {
    [key in keyof typeof blocks]: typeof blocks[key] extends Block<infer State, infer Inputs, infer Outputs> ? {
        state: State;
        inputs: Inputs;
        outputs: Outputs;
    } : never;
};
