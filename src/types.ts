import React from "react"
import * as t from "io-ts"

import { Schema, Instance } from "@underlay/apg"

import apg from "@underlay/apg-codec-apg"

export type Schemas = Record<string, Schema.Schema>
export type Instances = Record<string, Instance.Instance>
export type Paths = Record<string, string>

export type SchemaCodec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>

export interface Block<State, Inputs extends Schemas, Outputs extends Schemas> {
	state: t.Type<State>
	inputs: { [i in keyof Inputs]: SchemaCodec<Inputs[i]> }
	outputs: {
		[o in keyof Outputs]: SchemaCodec<Outputs[o]>
	}
	validate: Validate<State, Inputs, Outputs>
}

export const schema: SchemaCodec<Schema.Schema> = new t.Type<
	Schema.Schema,
	Schema.Schema,
	Schema.Schema
>("schema", apg.is, t.success, t.identity)

export type Validate<State, Inputs, Outputs> = (
	state: State,
	schemas: Inputs
) => Outputs

export type Editor<State> = React.FC<{
	state: State
	setState: (state: State) => void
}>

export type Evaluate<State, Inputs extends Schemas, Outputs extends Schemas> = (
	state: State,
	schemas: Inputs,
	instances: { [input in keyof Inputs]: Instance.Instance<Inputs[input]> }
) => Promise<{
	schemas: Outputs
	instances: { [output in keyof Outputs]: Instance.Instance<Outputs[output]> }
}>

// "start" is the start state; one start event is sent for every execution.
// Transitions:
// start -> result
// start -> failure
// result -> result
// result -> failure
// result -> success
// Every evaluate terminates in either a success of failure event.

export type EvaluateEventStart = t.TypeOf<typeof evaluateEventStart>
const evaluateEventStart = t.type({ event: t.literal("start") })

export type EvaluateEventResult = t.TypeOf<typeof evaluateEventResult>
const evaluateEventResult = t.type({ event: t.literal("result"), id: t.string })

export type EvaluateEventFailure = t.TypeOf<typeof evaluateEventFailure>
const evaluateEventFailure = t.type({
	event: t.literal("failure"),
	error: t.string,
	id: t.union([t.null, t.string]),
})

export type EvaluateEventSuccess = t.TypeOf<typeof evaluateEventSuccess>
const evaluateEventSuccess = t.type({ event: t.literal("success") })

export type EvaluateEvent = t.TypeOf<typeof evaluateEvent>
export const evaluateEvent = t.union([
	evaluateEventStart,
	evaluateEventResult,
	evaluateEventFailure,
	evaluateEventSuccess,
])

export const makeResultEvent = (id: string): EvaluateEventResult => ({
	event: "result",
	id,
})

export const makeFailureEvent = (
	id: string | null,
	error: string
): EvaluateEventFailure => ({ event: "failure", id, error })

export const makeSuccessEvent = (): EvaluateEventSuccess => ({
	event: "success",
})

export const invalidGraphEvent: EvaluateEventFailure = {
	event: "failure",
	error: "Invalid graph",
	id: null,
}
