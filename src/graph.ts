import * as t from "io-ts"

import { validateGraphTopology } from "./topology.js"

export const node = t.type({
	kind: t.string,
	inputs: t.record(t.string, t.string),
	outputs: t.record(t.string, t.array(t.string)),
	state: t.unknown,
})

export type Node = t.TypeOf<typeof node>

export const edge = t.type({
	source: t.type({ id: t.string, output: t.string }),
	target: t.type({ id: t.string, input: t.string }),
})

export type Edge = t.TypeOf<typeof edge>

export const baseGraph = t.type({
	nodes: t.record(t.string, node),
	edges: t.record(t.string, edge),
})

interface GraphBrand {
	readonly Graph: unique symbol
}

// The Graph codec validates basic graph structure;
// it does *not* check for cycles or for codec & block kind interfaces
export const Graph = t.brand(
	baseGraph,
	(graph): graph is t.Branded<t.TypeOf<typeof baseGraph>, GraphBrand> =>
		validateGraphTopology(graph),
	"Graph"
)

export type Graph = t.TypeOf<typeof Graph>

// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
export function sortGraph(graph: Graph): null | string[] {
	const edges = { ...graph.edges }
	const s: string[] = []
	for (const [id, node] of Object.entries(graph.nodes)) {
		if (Object.keys(node.inputs).length === 0) {
			s.push(id)
		}
	}

	const l: string[] = []
	while (s.length > 0) {
		const sourceId = s.pop()!
		l.push(sourceId)
		const { outputs } = graph.nodes[sourceId]
		for (const edgeIds of Object.values(outputs)) {
			for (const edgeId of edgeIds) {
				const {
					target: { id: targetId },
				} = edges[edgeId]
				delete edges[edgeId]
				const { inputs } = graph.nodes[targetId]
				const hasIncomingEdge = Object.values(inputs).some((id) => id in edges)
				if (!hasIncomingEdge) {
					s.push(targetId)
				}
			}
		}
	}

	const { length } = Object.keys(edges)
	return length === 0 ? l : null
}
