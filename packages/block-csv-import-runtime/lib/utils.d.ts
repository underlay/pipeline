import * as codec from "@underlay/block-csv-import-codec";
import * as t from "io-ts";
export declare const types: {};
export declare const paths: t.TypeC<{
    output: t.StringC;
}>;
export declare function validate(state: codec.State, inputSchemas: codec.Inputs): codec.Outputs;
