import * as t from "io-ts";
import table from "@underlay/apg-codec-table";
import { Pipe } from "@underlay/pipeline-runtime";
import codec from "@underlay/block-csv-import-codec";
declare type State = typeof codec extends t.Type<infer T> ? T : never;
declare type Table = typeof table extends t.Type<infer T, any, any> ? T : never;
declare const pipe: Pipe<State, {}, {
    output: Table;
}>;
export default pipe;
