import { Editor } from "../types.js";
import { Blocks } from "./index.js";
export declare type Editors = {
    [k in keyof Blocks]: Editor<Blocks[k]["state"]>;
};
export declare const editors: Editors;
