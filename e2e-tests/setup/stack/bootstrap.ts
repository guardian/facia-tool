import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { CreateTopicCommand, SNSClient } from "@aws-sdk/client-sns";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";

const region = "eu-west-1";
const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};

const permissions = JSON.stringify([
  {
    permission: {
      name: "fronts_access",
      app: "fronts",
      defaultValue: false,
    },
    overrides: [
      {
        userId: "e2e.editor@guardian.co.uk",
        active: true,
        isCasualNotOnShift: false,
      },
    ],
  },
]);

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

export async function bootstrapAws(endpoint: string): Promise<void> {
  const common = { endpoint, region, credentials };
  const s3 = new S3Client({ ...common, forcePathStyle: true });
  const dynamodb = new DynamoDBClient(common);
  const sqs = new SQSClient(common);
  const sns = new SNSClient(common);

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
        Body: permissions,
        ContentType: "application/json",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "facia-switches",
        Key: "CODE/status.json",
        Body: "{}",
        ContentType: "application/json",
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: "facia-tool-store-local",
        Key: "CODE/frontsapi/config/config.json",
        Body: JSON.stringify({ fronts: {}, collections: {} }),
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
}