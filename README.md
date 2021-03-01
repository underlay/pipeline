# pipeline

This monorepo has three packages

- [pipeline-codecs](./pipeline-codecs)
- [pipeline-editor](./pipeline-editor)
- [pipeline-runtime](./pipeline-runtime)

## `pipeline-codecs`

[pipeline-codecs](./pipeline-codecs) is a library of _interfaces_ for each block.

The base `Codec` type is defined in [pipeline-codecs/src/index.ts](./pipeline-codecs/src/index.ts):

```typescript
interface Codec<
	State,
	Inputs extends Record<string, Schema.Schema>,
	Outputs extends Record<string, Schema.Schema>
> {
	state: t.Type<State>
	inputs: { [i in keyof Inputs]: t.Type<Inputs[i], Inputs[i], Schema.Schema> }
	outputs: {
		[o in keyof Outputs]: t.Type<Outputs[o], Outputs[o], Schema.Schema>
	}
}
```

It is generic in three parameters: `State`, `Inputs`, and `Outputs`.

Each entry [pipeline-codecs/src/csv-import/index.ts](./pipeline-codecs/src/csv-import/index.ts), [pipeline-codecs/src/collection-export/index.ts](./pipeline-codecs/src/collection-export/index.ts), etc. exports a concrete `State`, `Inputs`, and `Outputs` type, as well as a concrete `Codec<State, Inputs, Outputs>` object containing runtime validators for the block's state, input schemas, and output schemas.

## `pipeline-editor`

[pipeline-editor](./pipeline-editor) is a library of React components for each block.

The base `Editor` type is defined in [pipeline-editor/src/index.ts](./pipeline-editor/src/index.ts):

```typescript
type Editor<State> = React.FC<{
	state: State
	setState: (state: State) => void
}>
```

Each entry [pipeline-editor/src/csv-import/index.tsx](./pipeline-editor/src/csv-import/index.tsx), [pipeline-editor/src/collection-export/index.tsx](./pipeline-editor/src/collection-export/index.tsx), etc. exports a `Editor<State>` function implementing a GUI editor for the block state.

## `pipeline-runtime`

[pipeline-runtime](./pipeline-runtime) is a library of runtime evaluators for each block.

Unlike pipeline-codecs and pipeline-editor, the purpose of the entries [pipeline-runtime/src/csv-import](./pipeline-runtime/src/csv-import), [pipeline-runtime/src/collection-export](./pipeline-runtime/src/collection-export), etc. is _not_ to export a value satisfying a common interface. Instead, each folder has has two files `validate.ts` and `evaluate.ts` that are invoked directly as top-level nodejs entrypoints. They are invoked by the worker, with command-line flags as arguments.

### Command-line arguments

Both take a `--state /path/to/state.json` argument, which must resolve to a JSON file validating the block codec's state type.

Both take a `--input-schemas foo=/path/to/foo.schema bar=/path/to/bar.schema ...` argument. Here `--input schemas` is followed by a series of `[name]=[path]` key/value pairs, where each `[name]` is the name of a block input (and there is one pair for every input; all inputs are required). The path must resolve to an APG Schema that validates the corresponding input schema type in the block codec.

Both take a `--output-schemas baz=/path/to/baz.schema quz=/path/to/quz.schema` argument. The format of the argument is the same as `--input-schemas`, except here the names correspond to the outputs of the block, and the paths locate output files that will be written to, not read from.

`evaluate.ts` (but not `validate.ts`) takes two additional `--input-instances foo=/path/to/foo.instance bar=/path/to/bar.instance ...` and `--output-instances baz=/path/to/baz.instance quz=/path/to/quz.instance` argument. The format of these arguments are again the same as `--input-schemas`, except this time each input path must resolve to an APG instance of the corresponding input schema (ie an instance of the exact schema that was given in the corresponding `--input-schemas` entry).

### Reading inputs

These arguments can be parsed with the utility functions `readValidateInputs` and `readEvaluateInputs`, which can be imported from [pipline-runtime/src/validate.ts](./pipeline-runtime/src/validate.ts) and [pipline-runtime/src/evaluate.ts](./pipeline-runtime/src/evaluate.ts), respectively.

[pipline-runtime/src/validate.ts](./pipeline-runtime/src/validate.ts) exports a function `readValidateInputs` with this signature:

```typescript
declare function readValidateInputs<
	State,
	Inputs extends Record<string, Schema.Schema>,
	Outputs extends Record<string, Schema.Schema>
>(
	codec: Codec<State, Inputs, Outputs>
): {
	state: State
	inputSchemaPaths: Record<keyof Inputs, string>
	inputSchemas: Inputs
	outputSchemaPaths: Record<keyof Outputs, string>
}
```

... while [pipline-runtime/src/evaluate.ts](./pipeline-runtime/src/evaluate.ts) exports a function `readEvaluateInputs` with this signature:

```typescript
declare function readEvaluateInputs<
	State,
	Inputs extends Record<string, Schema.Schema>,
	Outputs extends Record<string, Schema.Schema>
>(
	codec: Codec<State, Inputs, Outputs>
): {
	state: State
	inputSchemaPaths: Record<keyof Inputs, string>
	inputSchemas: Inputs
	inputInstancePaths: Record<keyof Inputs, string>
	inputInstances: { [i in keyof Inputs]: Instance.Instance<Inputs[i]> }
	outputSchemaPaths: Record<keyof Outputs, string>
	outputInstancePaths: Record<keyof Outputs, string>
}
```

### Writing outputs

The role of each block's `validate.ts` script is to produce output schemas; similarly, the role of each block's `evaluate.ts` script is to produce both output schemas and output instances. The paths that these files should be written to are given in the `--output-schemas` and `--output-instances` flags.

In addition to methods for reading inputs, both [pipline-runtime/src/validate.ts](./pipline-runtime/src/validate.ts) and [pipline-runtime/src/evaluate.ts](./pipline-runtime/src/evaluate.ts) also export methods to assist in writing outputs.

These methods have the signatures:

```typescript
declare function writeValidateOutputs<
	Outputs extends Record<string, Schema.Schema>
>(
	outputSchemaPaths: Record<keyof Outputs, string>,
	outputSchemas: Outputs
): void
```

```typescript
declare function writeEvaluateOutputs<
	Outputs extends Record<string, Schema.Schema>
>(
	outputSchemaPaths: Record<keyof Outputs, string>,
	outputSchemas: Outputs,
	outputInstancePaths: Record<keyof Outputs, string>,
	outputInstances: { [o in keyof Outputs]: Instance.Instance<Outputs[o]> }
): void
```

... respectively.

For example, a `validate.ts` script for a block `some-block` will start like this:

```typescript
import codec, {
	State,
	Inputs,
	Outputs,
} from "@underlay/pipeline-runtime/lib/some-block/index.js"

import { readValidateInputs, writeValidateOutputs } from "../validate.js"

const params = readValidateInputs<State, Inputs, Outputs>(codec)
```

... at which point the `params` object would parsed and validated `.state`, `.inputSchemas`, etc. properties. It would then do the appropriate computation to produce an object mapping output names to concrete outputs schemas, and then call `writeValidateOutputs` tbefore exiting:

```typescript
const outputs = {
	/* ... */
}
writeValidateOutputs<Outputs>(outputs)
```

When writing an `evaluate.ts` script, we would instead import `{ readEvaluateInputs, writeEvaluateOutputs }` from `../evaluate.js`.
