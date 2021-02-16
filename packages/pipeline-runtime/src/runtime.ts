import { Schema, Pipeline, Graph, Node, Edge } from "./interfaces.js"

import { right, left } from "fp-ts/Either"

import * as t from "io-ts"

const id = t.type({ id: t.number })

const makeGraphCodec = <S extends Schema>(
	pipeline: Pipeline<S>
): t.Type<Graph<S>> =>
	t.type({
		nodes: t.array(makeNodeCodec(pipeline)),
		edges: t.array(makeEdgeCodec(pipeline)),
	})

function makeNodeCodec<S extends Schema>(
	pipeline: Pipeline<S>
): t.Type<Node<S>> {
	const entries = Object.entries(pipeline).map(
		([kind, { codec }]: [string, Pipeline<S>[keyof S]]) => {
			const { state, inputs, outputs } = codec
			return t.type({ kind: t.literal(kind), state, inputs, outputs })
		}
	)

	type T = typeof entries[number]
	type N = t.Type<Node<S>>
	if (entries.length > 1) {
		return t.intersection([id, t.union(entries as [T, T, ...T[]])]) as N
	} else if (entries.length === 1) {
		const [entry] = entries
		return t.intersection([id, entry]) as N
	} else {
		throw new Error("Empty pipeline schema")
	}
}

const edgeCodec = t.type({
	id: t.number,
	source: t.type({ id: t.number, output: t.string }),
	target: t.type({ id: t.number, input: t.string }),
})

function makeEdgeCodec<S extends Schema>(
	pipeline: Pipeline<S>
): t.Type<Edge<S>> {
	return edgeCodec as t.Type<Edge<S>>
}

function sort<S extends Schema>(graph: Graph<S>) {
	const edges = new Map(graph.edges.map((edge) => [edge.id, edge]))
	const nodes = graph.nodes.slice().sort((a, b) => {
		for (const key of Object.keys(a.inputs)) {
			const id = a.inputs[key]
			if (id !== null && edges.has(id)) {
				const { source } = edges.get(id)!
				if (source.id === b.id && source.output in b.outputs) {
				}
			}
			if (a.inputs[key] !== null) {
			}
			const f = a.inputs[key]
		}
		return 0
	})
}

// a unique brand for positive numbers
interface AcyclicBrand {
	readonly Acyclic: unique symbol // use `unique symbol` here to ensure uniqueness across modules / packages
}

const makeAcyclicGraphCodec = <S extends Schema>(pipeline: Pipeline<S>) =>
	t.brand(
		makeGraphCodec(pipeline), // a codec representing the type to be refined
		(graph): graph is t.Branded<Graph<S>, AcyclicBrand> => {
			const nodes = new Map<number, keyof S>()
			for (const node of graph.nodes) {
				if (nodes.has(node.id)) {
					return false
				}
				node.inputs
			}
			return true
		}, // a custom type guard using the build-in helper `Branded`
		"Acyclic" // the name must match the readonly field in the brand
	)

export async function execute<S extends Schema>(
	pipeline: Pipeline<S>,
	graph: Graph<S>
): Promise<void> {}
