import * as t from "io-ts"

const baseGraphType = t.type({
	nodes: t.record(
		t.string,
		t.type({
			kind: t.string,
			inputs: t.record(t.string, t.string),
			outputs: t.record(t.string, t.array(t.string)),
			state: t.unknown,
		})
	),
	edges: t.record(
		t.string,
		t.type({
			source: t.type({ id: t.string, output: t.string }),
			target: t.type({ id: t.string, input: t.string }),
		})
	),
})

interface GraphBrand {
	readonly Graph: unique symbol
}

// The Graph codec validates basic graph structure;
// it does *not* check for cycles or for codec & block kind consistency
export const Graph = t.brand(
	baseGraphType,
	(g): g is t.Branded<t.TypeOf<typeof baseGraphType>, GraphBrand> => {
		if (!baseGraphType.is(g)) {
			return false
		}

		const targetEdgeIds = new Set(Object.keys(g.edges))
		const sourceEdgeIds = new Set(Object.keys(g.edges))

		for (const [id, node] of Object.entries(g.nodes)) {
			// Check that the inputs reference real edges
			for (const [input, edgeId] of Object.entries(node.inputs)) {
				if (
					edgeId in g.edges &&
					g.edges[edgeId].target.id === id &&
					g.edges[edgeId].target.input === input &&
					targetEdgeIds.delete(edgeId)
				) {
					continue
				} else {
					return false
				}
			}

			// Check that the outputs reference real edges
			for (const [output, ids] of Object.entries(node.outputs)) {
				for (const edgeId of ids) {
					if (
						edgeId in g.edges &&
						g.edges[edgeId].source.id === id &&
						g.edges[edgeId].source.output === output &&
						sourceEdgeIds.delete(edgeId)
					) {
						continue
					} else {
						return false
					}
				}
			}
		}

		// Make sure there are no extraneous edges
		if (targetEdgeIds.size > 0 || sourceEdgeIds.size > 0) {
			return false
		}

		return true
	},
	"Graph"
)

export type Graph = t.TypeOf<typeof Graph>

// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm 😇
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
