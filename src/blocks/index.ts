import { Block } from "../types.js"

import CsvImport from "./csv-import/index.js"
import CollectionExport from "./collection-export/index.js"

export const blocks = {
	"csv-import": CsvImport,
	"collection-export": CollectionExport,
}

export const isBlockKind = (key: string): key is keyof Blocks => key in blocks

export type Blocks = {
	[key in keyof typeof blocks]: typeof blocks[key] extends Block<
		infer State,
		infer Inputs,
		infer Outputs
	>
		? { state: State; inputs: Inputs; outputs: Outputs }
		: never
}
