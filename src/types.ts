import React from "react"
import * as t from "io-ts"

import { Schema, Instance } from "@underlay/apg"

import apg from "@underlay/apg-codec-apg"

export type Schemas = Record<string, Schema.Schema>
export type Instances = Record<string, Instance.Instance>
export type Paths = Record<string, string>

export type Codec<S extends Schema.Schema> = t.Type<S, S, Schema.Schema>

//https://github.com/sindresorhus/type-fest/
export type JsonObject = { [Key in string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonObject
	| JsonArray

export interface Block<
	State extends JsonObject,
	Inputs extends Schemas,
	Outputs extends Schemas
> {
	state: t.Type<State>
	inputs: { [i in keyof Inputs]: Codec<Inputs[i]> }
	outputs: {
		[o in keyof Outputs]: Codec<Outputs[o]>
	}
	initialValue: State
	validate: Validate<State, Inputs, Outputs>
}

export const schema: Codec<Schema.Schema> = new t.Type<
	Schema.Schema,
	Schema.Schema,
	Schema.Schema
>("schema", apg.is, t.success, t.identity)

export type Validate<
	State extends JsonObject,
	Inputs extends Schemas,
	Outputs extends Schemas
> = (state: State, schemas: Inputs) => Promise<Outputs>

export type ValidateError = GraphError | NodeError | EdgeError

export type GraphError = t.TypeOf<typeof graphError>
const graphError = t.type({
	type: t.literal("validate/graph"),
	message: t.string,
})

export function makeGraphError(message: string): GraphError {
	return { type: "validate/graph", message }
}

export type NodeError = t.TypeOf<typeof nodeError>
const nodeError = t.type({
	type: t.literal("validate/node"),
	id: t.string,
	message: t.string,
})

export function makeNodeError(id: string, message: string): NodeError {
	return { type: "validate/node", id, message }
}

export type EdgeError = t.TypeOf<typeof edgeError>
const edgeError = t.type({
	type: t.literal("validate/edge"),
	id: t.string,
	message: t.string,
})

export function makeEdgeError(id: string, message: string): EdgeError {
	return { type: "validate/edge", id, message }
}

export interface Editor<State extends JsonObject> {
	name: string
	backgroundColor?: React.CSSProperties["color"]
	component: React.FC<{
		state: State
		setState: (state: State) => void
	}>
}

export type Evaluate<
	State extends JsonObject,
	Inputs extends Schemas,
	Outputs extends Schemas
> = (
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
	error: t.union([graphError, nodeError, edgeError]),
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

export function makeResultEvent(id: string): EvaluateEventResult {
	return { event: "result", id }
}

export function makeFailureEvent(error: ValidateError): EvaluateEventFailure {
	return { event: "failure", error }
}

export function makeSuccessEvent(): EvaluateEventSuccess {
	return { event: "success" }
}
