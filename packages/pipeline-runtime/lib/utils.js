import { isLeft } from "fp-ts/lib/Either.js";
export const filePattern = /^([\w\-\.\/]+)=([\w\-\.\/]+)$/;
export function validateInputSchemas(codec, inputs) {
    for (const key of Object.keys(codec.inputs)) {
        const result = codec.inputs[key].decode(inputs[key]);
        if (isLeft(result)) {
            throw new Error(`Invalid schema for input ${key} ---\n${formatErrors(result.left)}`);
        }
    }
    return true;
}
export function validateInputInstances(inputSchemas, inputInstances) {
    for (const key of Object.keys(inputSchemas)) {
        if (key in inputInstances) {
            continue;
        }
        else {
            throw new Error(`Missing instance for input ${key}`);
        }
    }
    return true;
}
export function validateInputPaths(codec, inputPaths) {
    for (const key of Object.keys(codec.inputs)) {
        if (key in inputPaths) {
            continue;
        }
        else {
            throw new Error(`Missing path for input ${key}`);
        }
    }
    return true;
}
export function validateOutputPaths(codec, outputPaths) {
    for (const key of Object.keys(codec.outputs)) {
        if (key in outputPaths) {
            continue;
        }
        else {
            throw new Error(`Missing path for output ${key}`);
        }
    }
    return true;
}
export const formatErrors = (errors) => errors.map(formatError).join("\n");
function formatError({ context, message }) {
    const [path, name] = context.reduce(([path], { key, type }) => [path + "/" + key, type.name], ["", ""]);
    if (message === undefined) {
        return `${path.slice(1)}: ${name}`;
    }
    else {
        return `${path.slice(1)}: ${name} % ${message}`;
    }
}
