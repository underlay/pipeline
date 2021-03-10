import { State, Inputs, Outputs } from "../index.js"

import { Evaluate } from "../../../types.js"

const evaluate: Evaluate<State, Inputs, Outputs> = async (state, {}, {}) => {
	console.log("publishing collection! (not implemented)")
	return { schemas: {}, instances: {} }
}

export default evaluate
