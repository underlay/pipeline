import { Blocks } from "./index.js"

import CsvImport from "./csv-import/editor/index.js"
import CollectionExport from "./collection-export/editor/index.js"
import { Editor } from "../types.js"

type Editors = {
	[k in keyof Blocks]: Editor<Blocks[k]["state"]>
}

const editors: Editors = {
	"csv-import": CsvImport,
	"collection-export": CollectionExport,
}

export default editors
