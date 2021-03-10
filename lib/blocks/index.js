import CsvImport from "./csv-import/index.js";
import CollectionExport from "./collection-export/index.js";
export const blocks = {
    "csv-import": CsvImport,
    "collection-export": CollectionExport,
};
export const isKind = (key) => key in blocks;
