import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { StartedTestContainer } from "testcontainers";
import type { AppMode, RuntimeConfig, StartedMock } from "./types.js";

const region = "eu-west-1";

interface RuntimeConfigOptions {
  e2eRoot: string;
  repoRoot: string;
  mode: AppMode;
  postgres: StartedTestContainer;
  localstack: StartedTestContainer;
  mocks: StartedMock[];
  authCookie: string;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

export function writeRuntimeConfig({
  e2eRoot,
  repoRoot,
  mode,
  postgres,
  localstack,
  mocks,
  authCookie,
}: RuntimeConfigOptions): RuntimeConfig {
  const runtimeDirectory = join(e2eRoot, "target", "runtime", mode);
  mkdirSync(runtimeDirectory, { recursive: true });

  const inContainer = mode === "container";
  const applicationRoot = inContainer ? "/workspace" : repoRoot;
  const postgresHost = inContainer ? "postgres" : postgres.getHost();
  const postgresPort = inContainer ? 5432 : postgres.getMappedPort(5432);
  const awsEndpoint = inContainer
    ? "http://localstack:4566"
    : `http://${localstack.getHost()}:${localstack.getMappedPort(4566)}`;
  const permissionsS3Endpoint = inContainer
    ? "http://s3.localstack:4566"
    : `http://s3.localhost.localstack.cloud:${localstack.getMappedPort(4566)}`;
  const mockUrl = (name: string, hostname: string): string => {
    if (inContainer) {
      return `http://${hostname}:8080`;
    }
    const mock = mocks.find((candidate) => candidate.name === name);
    if (!mock) {
      throw new Error(`Missing mock container: ${name}`);
    }
    return `http://${mock.container.getHost()}:${mock.container.getMappedPort(8080)}`;
  };
  const applicationConfigPath = join(
    applicationRoot,
    "e2e-tests",
    "target",
    "runtime",
    mode,
    "application.e2e.conf",
  );
  const propertiesPath = join(
    applicationRoot,
    "e2e-tests",
    "target",
    "runtime",
    mode,
    "facia-tool.properties",
  );

  writeFileSync(
    join(runtimeDirectory, "application.e2e.conf"),
    `include file(${quote(join(applicationRoot, "conf", "application.conf"))})

db.default {
  hostname = ${quote(postgresHost)}
  port = ${postgresPort}
  username = "faciatool"
  password = "faciatool"
}

aws {
  region = ${quote(region)}
  bucket = "aws-frontend-store"
  frontsBucket = "facia-tool-store-local"
  publishedEditionsIssuesBucket = "published-editions-e2e"
  previewEditionsIssuesBucket = "preview-editions-e2e"
  localS3Endpoint = ${quote(permissionsS3Endpoint)}
}

content.api {
  host = ${quote(mockUrl("content-api", "content.guardianapis.com"))}
  key = "e2e"
  editions.apiKey = "e2e"
  draft {
    iam-host = ${quote(mockUrl("content-api", "preview.content.guardianapis.com"))}
    role = "arn:aws:iam::000000000000:role/e2e-capi-preview"
  }
}

ophan.api {
  host = ${quote(`${mockUrl("ophan", "api.ophan.co.uk")}/api`)}
  key = "e2e"
}

recipes.api {
  url = ${quote(mockUrl("recipes", "recipes.guardianapis.com"))}
  key = "e2e"
}

media {
  base.url = ${quote(mockUrl("grid", "api.media.local.dev-gutools.co.uk"))}
  api.url = ${quote(mockUrl("grid", "api.media.local.dev-gutools.co.uk"))}
  usage.url = ${quote(mockUrl("grid", "api.media.local.dev-gutools.co.uk"))}
  key = "e2e"
}

video.base.url = ${quote(mockUrl("video", "video.local.dev-gutools.co.uk"))}
notification {
  host = ${quote(mockUrl("mobile-notifications", "mobile-notifications.local.dev-gutools.co.uk"))}
  key = "e2e"
}

pandomain {
  host = ${quote(mockUrl("pan-domain-auth", "pan-domain-auth.local.dev-gutools.co.uk"))}
  domain = "local.dev-gutools.co.uk"
  service = "fronts"
  roleArn = "arn:aws:iam::000000000000:role/e2e-pan-domain"
  bucketName = "pan-domain-auth-settings"
  user.groups = "e2e"
}

permissions.cache = "permissions-cache/CODE"
switchboard {
  bucket = "facia-switches"
  object = "CODE/status.json"
}

publish_events.queue_url = ${quote(`${awsEndpoint}/000000000000/publish-events`)}
faciatool.sns.tool_topic_arn = "arn:aws:sns:eu-west-1:000000000000:facia-e2e"
feast_app.publication_topic = "arn:aws:sns:eu-west-1:000000000000:feast-e2e"
analytics.secret = "e2e"
sentry.publicDSN = ""
e2e {
  authCookie = ${quote(authCookie)}
  authCookieSecure = ${mode === "native"}
}
`,
  );

  writeFileSync(
    join(runtimeDirectory, "facia-tool.properties"),
    "STAGE=CODE\nSTS_ROLE=arn:aws:iam::000000000000:role/e2e\nFRONT_PRESSED_TABLE=front-pressed-e2e\nUSER_DATA_TABLE=user-data-e2e\n",
  );

  return {
    applicationConfigPath,
    propertiesPath,
    environment: {
      AWS_ENDPOINT_URL_DYNAMODB: awsEndpoint,
      AWS_ENDPOINT_URL_SNS: awsEndpoint,
      AWS_ENDPOINT_URL_SQS: awsEndpoint,
      AWS_ENDPOINT_URL_STS: awsEndpoint,
      AWS_ENDPOINT_URL_CLOUDWATCH: awsEndpoint,
      AWS_ACCESS_KEY_ID: "test",
      AWS_SECRET_ACCESS_KEY: "test",
      AWS_DEFAULT_REGION: region,
      AWS_REGION: region,
      AWS_ENDPOINT_URL_S3: permissionsS3Endpoint,
      FACIA_PROPERTIES_FILE: propertiesPath,
    },
  };
}