import { mkdirSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { Kafka } from "kafkajs";
import { invalidGraphEvent } from "../types.js";
import { Graph } from "../graph.js";
import evaluate from "./evaluate.js";
const rootDirectory = resolve(tmpdir());
console.log("root directory", rootDirectory);
const kafka = new Kafka({ brokers: ["localhost:9092"] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "pipeline-evaluate-runtime" });
await producer.connect();
await consumer.connect();
await consumer.subscribe({ topic: "pipeline-evaluate" });
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        const key = message.key.toString();
        const directory = resolve(rootDirectory, key);
        mkdirSync(directory);
        if (message.value === null) {
            return sendResult(key, invalidGraphEvent);
        }
        const graph = JSON.parse(message.value.toString("utf-8"));
        if (!Graph.is(graph)) {
            return sendResult(key, invalidGraphEvent);
        }
        for await (const event of evaluate(key, graph, directory)) {
            await sendResult(key, event);
        }
        // rmdirSync(directory)
    },
});
async function sendResult(key, result) {
    await producer.send({
        topic: "pipeline-evaluate-event",
        messages: [{ key, value: JSON.stringify(result) }],
    });
}
