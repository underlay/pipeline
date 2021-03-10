import { Schema } from "@underlay/apg";
import { Block } from "../../types.js";
export declare type State = {
    host: string;
    id: string;
};
export declare type Inputs = {
    input: Schema.Schema;
};
export declare type Outputs = {};
declare const codec: Block<State, Inputs, Outputs>;
export default codec;
