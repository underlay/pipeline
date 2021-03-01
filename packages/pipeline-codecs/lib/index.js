import * as t from "io-ts";
import apg from "@underlay/apg-codec-apg";
export const schema = new t.Type("schema", apg.is, (schema, context) => t.success(schema), t.identity);
