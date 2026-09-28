import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { CreateTopicCommand, SNSClient } from "@aws-sdk/client-sns";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PanDomainKeys } from "../panDomain.js";

const region = "eu-west-1";
const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};

async function createTable(
  client: DynamoDBClient,
  tableName: string,
  attributes: { name: string; type: "S" }[],
): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: attributes.map(({ name, type }) => ({
        AttributeName: name,
        AttributeType: type,
      })),
      KeySchema: attributes.map(({ name }, index) => ({
        AttributeName: name,
        KeyType: index === 0 ? "HASH" : "RANGE",
      })),
    }),
  );

  for (;;) {
    const response = await client.send(
      new DescribeTableCommand({ TableName: tableName }),
    );
    if (response.Table?.TableStatus === "ACTIVE") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function bootstrapAws(
  endpoint: string,
  e2eRoot: string,
  panDomainKeys: PanDomainKeys,
): Promise<void> {
  const common = { endpoint, region, credentials };
  const s3 = new S3Client({ ...common, forcePathStyle: true });
  const dynamodb = new DynamoDBClient(common);
  const sqs = new SQSClient(common);
  const sns = new SNSClient(common);
  const fixture = (path: string): string =>
    readFileSync(join(e2eRoot, "fixtures", path), "utf8");
  const panDomainSettings = `${fixture(
    "pan-domain/local.dev-gutools.co.uk.settings",
  )}\npublicKey=${panDomainKeys.publicKeyBase64}\nprivateKey=${panDomainKeys.privateKeyBase64}\n`;

  const buckets = [
    "facia-tool-store-local",
    "facia-switches",
    "pan-domain-auth-settings",
    "permissions-cache",
    "preview-editions-e2e",
    "published-editions-e2e",
  ];
  await Promise.all(
    buckets.map((Bucket) => s3.send(new CreateBucketCommand({ Bucket }))),
  );
  await Promise.all([
    s3.send(
      new PutObjectCommand({
        Bucket: "permissions-cache",
        Key: "CODE/permissions.json",
        Body: fixture("s3/permissions-cache/CODE/permissions.json"),
        ContentType: "application/json",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "pan-domain-auth-settings",
        Key: "local.dev-gutools.co.uk.settings",
        Body: panDomainSettings,
        ContentType: "text/plain",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "pan-domain-auth-settings",
        Key: "local.dev-gutools.co.uk.settings.public",
        Body: `publicKey=${panDomainKeys.publicKeyBase64}\n`,
        ContentType: "text/plain",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "facia-switches",
        Key: "CODE/status.json",
        Body: fixture("s3/facia-switches/CODE/status.json"),
        ContentType: "application/json",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "facia-tool-store-local",
        Key: "CODE/frontsapi/config/config.json",
        Body: fixture(
          "s3/facia-tool-store-local/CODE/frontsapi/config/config.json",
        ),
        ContentType: "application/json",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "facia-tool-store-local",
        Key: "CODE/frontsapi/collection/e2e-collection/collection.json",
        Body: fixture(
          "s3/facia-tool-store-local/CODE/frontsapi/collection/e2e-collection/collection.json",
        ),
        ContentType: "application/json",
      }),
    ),
  ]);

  await Promise.all([
    createTable(dynamodb, "front-pressed-e2e", [
      { name: "stageName", type: "S" },
      { name: "frontId", type: "S" },
    ]),
    createTable(dynamodb, "user-data-e2e", [{ name: "email", type: "S" }]),
    sqs.send(new CreateQueueCommand({ QueueName: "publish-events" })),
    sns.send(new CreateTopicCommand({ Name: "facia-e2e" })),
    sns.send(new CreateTopicCommand({ Name: "feast-e2e" })),
  ]);

  await dynamodb.send(
    new PutItemCommand({
      TableName: "user-data-e2e",
      Item: JSON.parse(fixture("dynamodb/user-data-e2e.json")),
    }),
  );
}