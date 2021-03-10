import CsvImport from "./csv-import/runtime/index.js";
import CollectionExport from "./collection-export/runtime/index.js";
const runtimes = {
    "csv-import": CsvImport,
    "collection-export": CollectionExport,
};
export default runtimes;
