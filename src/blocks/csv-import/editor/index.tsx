import React from "react"

import { Editor } from "../../../types.js"

// It's important that this is a type-only import
import { State } from "../index.js"

const CsvImportEditor: Editor<State> = {
	name: "CSV Import",
	backgroundColor: "lavender",
	component({ state, setState }) {
		return <div></div>
	},
}

export default CsvImportEditor
