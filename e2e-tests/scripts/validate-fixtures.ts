import { spawnSync } from "node:child_process";
import { GetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

const mockProbes: Record<
  string,
  { method: "GET" | "POST"; path: string; contains?: string }
> = {
  "content-api": {
    method: "GET",
    path: "/search",
    contains: "Synthetic E2E article",
  },
  ophan: { method: "GET", path: "/api/histogram", contains: "totalHits" },
  recipes: { method: "GET", path: "/search", contains: "results" },
  grid: { method: "GET", path: "/images/e2e-image", contains: "e2e-image" },
  "mobile-notifications": {
    method: "POST",
    path: "/notifications",
    contains: "accepted",
  },
  "pan-domain-auth": {
    method: "GET",
    path: "/oauthCallback",
    contains: "unused-in-e2e",
  },
  video: { method: "GET", path: "/videos/e2e", contains: "e2e-video" },
  telemetry: { method: "GET", path: "/guardian-tool-accessed" },
  pinboard: {
    method: "GET",
    path: "/pinboard.loader.js",
    contains: "guardianPinboardE2E",
  },
};

function dockerIds(args: string[]): string[] {
  const result = spawnSync("docker", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `docker ${args.join(" ")} failed`);
  }
  return result.stdout.trim().split("\n").filter(Boolean);
}

async function readS3Object(
  client: S3Client,
  bucket: string,
  key: string,
): Promise<string> {
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  return (await response.Body?.transformToString()) ?? "";
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

async function validateSeededAws(endpoint: string): Promise<void> {
  const common = { endpoint, region, credentials };
  const s3 = new S3Client({ ...common, forcePathStyle: true });
  const dynamodb = new DynamoDBClient(common);
  const [config, collection, permissions, settings, publicSettings, user] =
    await Promise.all([
      readS3Object(
        s3,
        "facia-tool-store-local",
        "CODE/frontsapi/config/config.json",
      ),
      readS3Object(
        s3,
        "facia-tool-store-local",
        "CODE/frontsapi/collection/e2e-collection/collection.json",
      ),
      readS3Object(s3, "permissions-cache", "CODE/permissions.json"),
      readS3Object(
        s3,
        "pan-domain-auth-settings",
        "local.dev-gutools.co.uk.settings",
      ),
      readS3Object(
        s3,
        "pan-domain-auth-settings",
        "local.dev-gutools.co.uk.settings.public",
      ),
      dynamodb.send(
        new GetItemCommand({
          TableName: "user-data-e2e",
          Key: { email: { S: "e2e.editor@guardian.co.uk" } },
        }),
      ),
    ]);

  if (!config.includes("e2e/editorial") || !collection.includes("e2e/article")) {
    throw new Error("Seeded front or collection fixture is missing");
  }
  if (!permissions.includes("edit_editorial_fronts")) {
    throw new Error("Seeded editorial permission is missing");
  }
  if (
    !settings.includes("privateKey=") ||
    !settings.includes("publicKey=") ||
    publicSettings.includes("privateKey=") ||
    !publicSettings.includes("publicKey=")
  ) {
    throw new Error("Generated pan-domain settings are invalid");
  }
  if (!user.Item?.frontIdsByPriority) {
    throw new Error("Seeded DynamoDB user preferences are missing");
  }
}

console.log("Starting fixture validation stack");
const stack = await startLocalStack({ appMode: "container" });
const networkName = stack.network.getName();
let validationError: unknown;

try {
  console.log("Checking server-issued authentication and app-backed fixtures");
  const cookieResponse = await fetch(`${stack.connection.baseUrl}/cookie`, {
    redirect: "manual",
  });
  const setCookie = cookieResponse.headers.get("set-cookie");
  if (!setCookie?.startsWith(`${stack.connection.authCookieName}=`)) {
    throw new Error("The local auth endpoint did not issue the pan-domain cookie");
  }
  const cookieHeader = setCookie.split(";", 1)[0];
  const authenticatedPage = await fetch(`${stack.connection.baseUrl}/v2`, {
    headers: { Cookie: cookieHeader },
  });
  if (!authenticatedPage.ok) {
    throw new Error(`Authenticated /v2 returned ${authenticatedPage.status}`);
  }
  const configResponse = await fetch(`${stack.connection.baseUrl}/config`, {
    headers: { Cookie: cookieHeader },
  });
  const configBody = await configResponse.text();
  if (!configResponse.ok || !configBody.includes("e2e/editorial")) {
    throw new Error("The app did not expose the seeded editorial front");
  }
  const collectionsResponse = await fetch(
    `${stack.connection.baseUrl}/collections`,
    {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ id: "e2e-collection" }]),
    },
  );
  const collectionsBody = await collectionsResponse.text();
  if (!collectionsResponse.ok || !collectionsBody.includes("e2e/article")) {
    throw new Error("The app did not expose the seeded collection/card");
  }

  console.log("Checking seeded S3, DynamoDB and generated auth settings");
  await validateSeededAws(stack.connection.localStackEndpoint);

  console.log("Checking WireMock routes and unmatched request journals");
  for (const mock of stack.mocks) {
    const probe = mockProbes[mock.name];
    if (!probe) {
      throw new Error(`No fixture probe configured for ${mock.name}`);
    }
    const baseUrl = `http://${mock.container.getHost()}:${mock.container.getMappedPort(8080)}`;
    const response = await fetch(`${baseUrl}${probe.path}`, {
      method: probe.method,
    });
    const body = await response.text();
    if (!response.ok || (probe.contains && !body.includes(probe.contains))) {
      throw new Error(`${mock.name} fixture probe failed with ${response.status}`);
    }
    const unmatched = (await fetch(`${baseUrl}/__admin/requests/unmatched`).then(
      (adminResponse) => adminResponse.json(),
    )) as { requests?: unknown[] };
    if (unmatched.requests?.length) {
      throw new Error(`${mock.name} recorded unmatched requests`);
    }
  }

  console.log("Checking app logs for unexpected runtime errors");
  if (!stack.app) {
    throw new Error("App container was not started");
  }
  const appLogs = await captureLogs(stack.app);
  if (/"level":"ERROR"/.test(appLogs)) {
    throw new Error("App logs contain an unexpected runtime error");
  }
} catch (error) {
  validationError = error;
} finally {
  console.log("Stopping fixture validation stack");
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

console.log("Fixture validation passed");