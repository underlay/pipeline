import { Blocks } from "./index.js";
import { Evaluate } from "../types.js";
declare type Runtimes = {
    [k in keyof Blocks]: Evaluate<Blocks[k]["state"], Blocks[k]["inputs"], Blocks[k]["outputs"]>;
};
declare const runtimes: Runtimes;
export default runtimes;
