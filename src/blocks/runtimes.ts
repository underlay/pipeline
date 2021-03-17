import { Blocks } from "./index.js"

import CsvImport from "./csv-import/runtime/index.js"
import CollectionExport from "./collection-export/runtime/index.js"
import { Evaluate } from "../types.js"

export type Runtimes = {
	[k in keyof Blocks]: Evaluate<
		Blocks[k]["state"],
		Blocks[k]["inputs"],
		Blocks[k]["outputs"]
	>
}

export const runtimes: Runtimes = {
	"csv-import": CsvImport,
	"collection-export": CollectionExport,
}
