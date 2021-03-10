import { Blocks } from "./index.js";
import { Editor } from "../types.js";
declare type Editors = {
    [k in keyof Blocks]: Editor<Blocks[k]["state"]>;
};
declare const editors: Editors;
export default editors;
