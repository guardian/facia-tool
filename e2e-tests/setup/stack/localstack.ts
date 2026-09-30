import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BatchWriteItemCommand,
  CreateTableCommand,
  DynamoDBClient,
  type AttributeDefinition,
  type KeySchemaElement,
  type WriteRequest,
} from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { CreateTopicCommand, SNSClient } from "@aws-sdk/client-sns";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import {
  AWS_REGION,
  DYNAMO_TABLES,
  LOCALSTACK_HOST_PORT,
  LOCALSTACK_PORT,
  PANDA_SETTINGS_KEY,
  S3_BUCKETS,
  SNS_TOPIC_NAMES,
  SQS_QUEUE_NAME,
} from "../constants";
import type { PanDomainKeys } from "../panDomainKeys";

const credentials = { accessKeyId: "test", secretAccessKey: "test" };

function localstackAliases(): string[] {
  return [
    "localstack",
    "s3.localstack",
    ...S3_BUCKETS.map((bucket) => `${bucket}.s3.localstack`),
  ];
}

export async function startAws(
  network: StartedNetwork,
  streamLogs: boolean,
): Promise<StartedTestContainer> {
  let container = new GenericContainer("localstack/localstack:4")
    .withNetwork(network)
    .withNetworkAliases(...localstackAliases())
    .withEnvironment({
      SERVICES: "s3,dynamodb,sns,sqs,sts",
      AWS_DEFAULT_REGION: AWS_REGION,
      DEBUG: "0",
    })
    .withExposedPorts({
      container: LOCALSTACK_PORT,
      host: LOCALSTACK_HOST_PORT,
    })
    .withWaitStrategy(Wait.forLogMessage(/Ready\./, 1))
    .withStartupTimeout(120_000);

  if (streamLogs) {
    container = container.withLogConsumer((stream) => {
      stream.on("data", (line) => process.stdout.write(`[localstack] ${line}`));
    });
  }

  return container.start();
}

function endpoint(): string {
  return `http://localhost:${LOCALSTACK_HOST_PORT}`;
}

export async function seedAws(
  e2eRoot: string,
  keys: PanDomainKeys,
): Promise<void> {
  await Promise.all([
    seedS3(e2eRoot, keys),
    seedDynamo(e2eRoot),
    seedMessaging(),
  ]);
}

async function seedS3(e2eRoot: string, keys: PanDomainKeys): Promise<void> {
  const client = new S3Client({
    region: AWS_REGION,
    endpoint: endpoint(),
    forcePathStyle: true,
    credentials,
  });

  for (const bucket of S3_BUCKETS) {
    await client.send(
      new CreateBucketCommand({
        Bucket: bucket,
        CreateBucketConfiguration: { LocationConstraint: AWS_REGION },
      }),
    );
  }

  const settingsBase = readFileSync(
    join(e2eRoot, "fixtures/pan-domain-settings", PANDA_SETTINGS_KEY),
    "utf8",
  );
  const settings =
    settingsBase +
    `publicKey=${keys.publicKeyBase64}\n` +
    `privateKey=${keys.privateKeyBase64}\n`;

  const objects = [
    {
      Bucket: "pan-domain-auth-settings",
      Key: PANDA_SETTINGS_KEY,
      Body: settings,
    },
    {
      Bucket: "pan-domain-auth-settings",
      Key: `${PANDA_SETTINGS_KEY}.public`,
      Body: settingsBase + `publicKey=${keys.publicKeyBase64}\n`,
    },
    {
      Bucket: "permissions-cache",
      Key: "CODE/permissions.json",
      Body: readFileSync(
        join(e2eRoot, "fixtures/permissions/e2e-permissions.json"),
      ),
    },
    {
      Bucket: "facia-switches",
      Key: "CODE/status.json",
      Body: readFileSync(join(e2eRoot, "fixtures/fronts/switches.json")),
    },
    {
      Bucket: "facia-tool-store",
      Key: "CODE/frontsapi/config/config.json",
      Body: readFileSync(join(e2eRoot, "fixtures/fronts/config.json")),
    },
    {
      Bucket: "facia-tool-store",
      Key: "CODE/frontsapi/collection/e2e-editorial/collection.json",
      Body: readFileSync(
        join(e2eRoot, "fixtures/fronts/e2e-editorial.collection.json"),
      ),
    },
  ];

  await Promise.all(
    objects.map((object) => client.send(new PutObjectCommand(object))),
  );
}

async function seedDynamo(e2eRoot: string): Promise<void> {
  const client = new DynamoDBClient({
    region: AWS_REGION,
    endpoint: endpoint(),
    credentials,
  });

  for (const table of DYNAMO_TABLES) {
    const attributes: AttributeDefinition[] = [
      { AttributeName: table.hashKey, AttributeType: "S" },
    ];
    const keySchema: KeySchemaElement[] = [
      { AttributeName: table.hashKey, KeyType: "HASH" },
    ];
    if ("rangeKey" in table) {
      attributes.push({ AttributeName: table.rangeKey, AttributeType: "S" });
      keySchema.push({ AttributeName: table.rangeKey, KeyType: "RANGE" });
    }
    await client.send(
      new CreateTableCommand({
        TableName: table.name,
        AttributeDefinitions: attributes,
        KeySchema: keySchema,
        BillingMode: "PAY_PER_REQUEST",
      }),
    );
  }

  const requestItems = JSON.parse(
    readFileSync(join(e2eRoot, "fixtures/dynamodb/user-data.json"), "utf8"),
  ) as Record<string, WriteRequest[]>;
  await client.send(new BatchWriteItemCommand({ RequestItems: requestItems }));
}

async function seedMessaging(): Promise<void> {
  const sqs = new SQSClient({
    region: AWS_REGION,
    endpoint: endpoint(),
    credentials,
  });
  const sns = new SNSClient({
    region: AWS_REGION,
    endpoint: endpoint(),
    credentials,
  });
  await Promise.all([
    sqs.send(new CreateQueueCommand({ QueueName: SQS_QUEUE_NAME })),
    ...SNS_TOPIC_NAMES.map((Name) =>
      sns.send(new CreateTopicCommand({ Name })),
    ),
  ]);
}
