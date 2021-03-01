import { createReadStream, statSync } from "fs"
import { createGzip } from "zlib"

import { v4 as uuid } from "uuid"

import tar from "tar-stream"

import fetch from "node-fetch"

import codec, {
	State,
	Inputs,
	Outputs,
} from "@underlay/pipeline-codecs/lib/collection-export/index.js"

import { readEvaluateInputs, writeEvaluateOutputs } from "../evaluate.js"

const params = readEvaluateInputs<State, Inputs, Outputs>(codec)
const {
	inputSchemaPaths: { input: inputSchemaPath },
	inputInstancePaths: { input: inputInstancePath },
	state,
} = params

const schemaStat = statSync(inputSchemaPath)
const instanceStat = statSync(inputInstancePath)

const content = tar.pack()

const inputSchemaStream = createReadStream(inputSchemaPath)
const inputSchemaEntry = content.entry(
	{ name: "index.schema", size: schemaStat.size },
	(err) => {
		if (err) {
			throw err
		} else {
			const inputInstanceStream = createReadStream(inputInstancePath)
			const inputInstanceEntry = content.entry(
				{ name: `instances/${uuid()}.instance`, size: instanceStat.size },
				(err) => {
					if (err) {
						throw err
					} else {
						content.finalize()
					}
				}
			)

			inputInstanceStream.pipe(inputInstanceEntry)
		}
	}
)

inputSchemaStream.pipe(inputSchemaEntry)

const host = `host=${encodeURIComponent(state.host)}`
const id = `id=${encodeURIComponent(state.id)}`
const res = await fetch(
	`http://localhost:8086/api/v0/collection?${host}&${id}`,
	{
		method: "POST",
		body: content.pipe(createGzip()),
		headers: {
			"Content-Type": "application/x-tar",
			"Content-Encoding": "gzip",
		},
	}
)

if (res.status !== 204) {
	throw new Error(res.statusText)
}

writeEvaluateOutputs<Outputs>({}, {}, {}, {})
