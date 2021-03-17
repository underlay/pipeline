import { Editor } from "../types.js"

// It's important that this is a type-only import
import { Blocks } from "./index.js"

import CsvImport from "./csv-import/editor/index.js"
import CollectionExport from "./collection-export/editor/index.js"

export type Editors = {
	[k in keyof Blocks]: Editor<Blocks[k]["state"]>
}

export const editors: Editors = {
	"csv-import": CsvImport,
	"collection-export": CollectionExport,
}
