// node ./lib/evaluate.js
//    --state state-file.json
//    --input-schemas foo=bar.schema bar=bax.jkfslda ...
//		--input-instances foo= ...
//    --output-schemas bar=output.schema ...
//    --output-instances output=foo.instance ...
import { readFileSync, writeFileSync } from "fs";
import { encode, decode } from "@underlay/apg-format-binary";
import schemaSchema, { toSchema, fromSchema, } from "@underlay/apg-schema-schema";
export function readEvaluateInputs(codec, types, paths) {
    const flags = {};
    let current = [];
    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith("--")) {
            const flag = arg.slice(2);
            flags[flag] = [];
            current = flags[flag];
        }
        else {
            current.push(arg);
        }
    }
    let state;
    const stateValues = flags["state"];
    if (stateValues !== undefined && stateValues.length === 1) {
        const [path] = stateValues;
        state = JSON.parse(readFileSync(path, "utf-8"));
    }
    else {
        throw new Error("Invalid --state flag");
    }
    if (codec.is(state) === false) {
        throw new Error("Invalid state value");
    }
    const filePattern = /^(\w+)=(\w+)$/;
    const inputSchemas = {};
    const inputSchemaValues = flags["input-schemas"];
    if (inputSchemaValues !== undefined) {
        for (const value of inputSchemaValues) {
            const match = filePattern.exec(value);
            if (match !== null) {
                const [_, input, path] = match;
                const file = readFileSync(path);
                const instance = decode(schemaSchema, file);
                inputSchemas[input] = toSchema(instance);
            }
            else {
                throw new Error("Invalid input schema value");
            }
        }
    }
    else {
        throw new Error("Invalid --input-schemas flag");
    }
    if (!validateInputSchemas(types, inputSchemas)) {
        throw new Error("Invalid input schemas");
    }
    const inputInstances = {};
    const inputInstanceValues = flags["input-instances"];
    if (inputInstanceValues !== undefined) {
        for (const value of inputInstanceValues) {
            const match = filePattern.exec(value);
            if (match !== null) {
                const [_, input, path] = match;
                const file = readFileSync(path);
                const instance = decodeInputInstance(inputSchemas, input, file);
                inputInstances[input] = instance;
            }
            else {
                throw new Error("Invalid input schema value");
            }
        }
    }
    else {
        throw new Error("Invalid --input-schemas flag");
    }
    if (!validateInputInstances(inputSchemas, inputInstances)) {
        throw new Error("Invalid input instances");
    }
    const outputSchemaPaths = {};
    const outputSchemaPathValues = flags["output-schemas"];
    if (outputSchemaPathValues !== undefined) {
        for (const value of outputSchemaPathValues) {
            const match = filePattern.exec(value);
            if (match !== null) {
                const [_, output, path] = match;
                outputSchemaPaths[output] = path;
            }
            else {
                throw new Error("Invalid output schema value");
            }
        }
    }
    else {
        throw new Error("Invalid --output-schemas flag");
    }
    const outputInstancePaths = {};
    const outputInstancePathValues = flags["output-instances"];
    if (outputInstancePathValues !== undefined) {
        for (const value of outputInstancePathValues) {
            const match = filePattern.exec(value);
            if (match !== null) {
                const [_, output, path] = match;
                outputInstancePaths[output] = path;
            }
            else {
                throw new Error("Invalid output schema value");
            }
        }
    }
    else {
        throw new Error("Invalid --output-schemas flag");
    }
    if (paths.is(outputSchemaPaths) && paths.is(outputInstancePaths)) {
        return {
            state,
            inputSchemas,
            inputInstances,
            outputSchemaPaths,
            outputInstancePaths,
        };
    }
    else {
        throw new Error("Invalid output paths");
    }
}
const decodeInputInstance = (inputSchemas, key, file) => decode(inputSchemas[key], file);
const validateInputSchemas = (types, inputs) => Object.keys(types).every((key) => types[key].is(inputs[key]));
const validateInputInstances = (inputSchemas, inputInstances) => Object.keys(inputSchemas).every((key) => key in inputInstances);
export function writeEvaluateOutputs(outputSchemaPaths, outputSchemas, outputInstancePaths, outputInstances) {
    for (const key of Object.keys(outputSchemas)) {
        const path = outputSchemaPaths[key];
        const instance = fromSchema(outputSchemas[key]);
        const buffer = encode(schemaSchema, instance);
        writeFileSync(path, buffer);
    }
    for (const key of Object.keys(outputInstances)) {
        const path = outputInstancePaths[key];
        const buffer = encode(outputSchemas[key], outputInstances[key]);
        writeFileSync(path, buffer);
    }
}
