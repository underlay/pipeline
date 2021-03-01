import { Schema } from "@underlay/apg";
import { Codec } from "../index.js";
export declare type State = {
    host: string;
    id: string;
};
export declare type Inputs = {
    input: Schema.Schema;
};
export declare type Outputs = {};
declare const codec: Codec<State, Inputs, Outputs>;
export default codec;
