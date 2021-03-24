interface Graph {
	nodes: Record<string, Node>
	edges: Record<string, Edge>
}

interface Node {
	inputs: Record<string, string | null>
	outputs: Record<string, string[]>
}

interface Edge {
	source: { id: string; output: string }
	target: { id: string; input: string }
}

// This is designed to be re-usable for *other graph formats*,
// such as the (slightly different) one that react-dataflow-editor uses.
// That's why the graph/node/edge interfaces are defined locally here
// without state or kind or inline id properties.
// This one function might actually make sense as its own npm module.
export function validateGraphTopology({ nodes, edges }: Graph) {
	const targetEdgeIds = new Set(Object.keys(edges))
	const sourceEdgeIds = new Set(Object.keys(edges))

	for (const [id, node] of Object.entries(nodes)) {
		// Check that the inputs reference real edges
		for (const [input, edgeId] of Object.entries(node.inputs)) {
			if (edgeId === null) {
				continue
			} else if (
				edgeId in edges &&
				edges[edgeId].target.id === id &&
				edges[edgeId].target.input === input &&
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
					edgeId in edges &&
					edges[edgeId].source.id === id &&
					edges[edgeId].source.output === output &&
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
}
