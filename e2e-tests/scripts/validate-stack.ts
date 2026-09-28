import { spawnSync } from "node:child_process";
import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { ListTopicsCommand, SNSClient } from "@aws-sdk/client-sns";
import { GetQueueUrlCommand, SQSClient } from "@aws-sdk/client-sqs";
import type { StartedTestContainer } from "testcontainers";
import {
  startLocalStack,
  stopLocalStack,
} from "../setup/stackContainers.js";
import { stackLabel } from "../setup/stack/infrastructure.js";

const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};
const region = "eu-west-1";

function dockerIds(args: string[]): string[] {
  const result = spawnSync("docker", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `docker ${args.join(" ")} failed`);
  }
  return result.stdout.trim().split("\n").filter(Boolean);
}

async function captureLogs(
  container: StartedTestContainer,
  durationMs = 500,
): Promise<string> {
  const stream = await container.logs();
  let output = "";
  stream.on("data", (chunk) => {
    output += chunk.toString();
  });
  stream.on("err", (chunk) => {
    output += chunk.toString();
  });
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  stream.destroy();
  return output;
}

async function validateAws(endpoint: string): Promise<void> {
  const common = { endpoint, region, credentials };
  const [buckets, tables, queue, topics] = await Promise.all([
    new S3Client({ ...common, forcePathStyle: true }).send(
      new ListBucketsCommand({}),
    ),
    new DynamoDBClient(common).send(new ListTablesCommand({})),
    new SQSClient(common).send(
      new GetQueueUrlCommand({ QueueName: "publish-events" }),
    ),
    new SNSClient(common).send(new ListTopicsCommand({})),
  ]);

  const bucketNames = new Set(buckets.Buckets?.map(({ Name }) => Name));
  for (const bucket of [
    "facia-tool-store-local",
    "facia-switches",
    "permissions-cache",
  ]) {
    if (!bucketNames.has(bucket)) {
      throw new Error(`Missing LocalStack bucket: ${bucket}`);
    }
  }
  for (const table of ["front-pressed-e2e", "user-data-e2e"]) {
    if (!tables.TableNames?.includes(table)) {
      throw new Error(`Missing LocalStack table: ${table}`);
    }
  }
  if (!queue.QueueUrl || !topics.Topics || topics.Topics.length < 2) {
    throw new Error("LocalStack queue/topics were not created");
  }
}

console.log("Starting owned facia-tool e2e stack");
const stack = await startLocalStack({ appMode: "container" });
const networkName = stack.network.getName();
let validationError: unknown;

try {
  console.log(`Checking app health at ${stack.connection.baseUrl}`);
  const health = await fetch(`${stack.connection.baseUrl}/_healthcheck`);
  if (!health.ok) {
    throw new Error(`Healthcheck returned ${health.status}`);
  }

  console.log("Checking LocalStack resources");
  await validateAws(stack.connection.localStackEndpoint);

  console.log("Checking app logs for real AWS endpoints");
  if (!stack.app) {
    throw new Error("App container was not started");
  }
  const appLogs = await captureLogs(stack.app);
  if (/https?:\/\/[^\s]*amazonaws\.com/i.test(appLogs)) {
    throw new Error("App logs contain a real AWS endpoint");
  }
} catch (error) {
  validationError = error;
} finally {
  console.log("Stopping owned facia-tool e2e stack");
  await stopLocalStack(stack);
}

const leakedContainers = dockerIds([
  "ps",
  "--all",
  "--quiet",
  "--filter",
  `label=${stackLabel}=${stack.runId}`,
]);
const leakedNetworks = dockerIds([
  "network",
  "ls",
  "--quiet",
  "--filter",
  `name=^${networkName}$`,
]);
if (leakedContainers.length > 0 || leakedNetworks.length > 0) {
  throw new Error(
    `Leaked resources: ${leakedContainers.length} containers, ${leakedNetworks.length} networks`,
  );
}
if (validationError) {
  throw validationError;
}

console.log("Stack validation passed");