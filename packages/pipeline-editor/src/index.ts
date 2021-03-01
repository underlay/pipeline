import React from "react"

export type Editor<State> = React.FC<{
	state: State
	setState: (state: State) => void
}>
