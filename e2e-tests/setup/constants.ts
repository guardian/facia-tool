export const APP_CONTAINER_PORT = 9000;
export const APP_TEST_PORT = 9091;
export const AUTH_PROXY_PORT = 9000;
export const CI_AUTH_PROXY_PORT = 9090;
export const VITE_PORT = 5173;
export const APP_NETWORK_ALIAS = "facia-tool";

export const LOCALSTACK_PORT = 4566;
export const LOCALSTACK_HOST_PORT = 4567;

export const POSTGRES_PORT = 5432;
export const POSTGRES_HOST_PORT = 4725;
export const POSTGRES_DB = "faciatool";
export const POSTGRES_USER = "faciatool";
export const POSTGRES_PASSWORD = "faciatool";
export const DB_NETWORK_ALIAS = "faciadb";

export const AWS_REGION = "eu-west-1";
export const TOOLS_DOMAIN = "local.dev-gutools.co.uk";
export const APP_HOSTNAME = `fronts.${TOOLS_DOMAIN}`;
export const LOCAL_APP_BASE_URL = `http://localhost:${AUTH_PROXY_PORT}`;
export const CI_APP_BASE_URL = `http://localhost:${CI_AUTH_PROXY_PORT}`;
export const APP_HEALTH_URL = `http://localhost:${APP_TEST_PORT}/_healthcheck`;
export const PANDA_COOKIE_NAME = "gutoolsAuth-assym";
export const PANDA_SETTINGS_KEY = `${TOOLS_DOMAIN}.settings`;

export const S3_BUCKETS = [
  "pan-domain-auth-settings",
  "permissions-cache",
  "facia-tool-store",
  "aws-frontend-store",
  "facia-switches",
  "published-editions-code",
  "preview-editions-code",
] as const;

export const DYNAMO_TABLES = [
  { name: "user-data-CODE", hashKey: "email" },
  { name: "front-pressed-CODE", hashKey: "stageName", rangeKey: "frontId" },
] as const;

export const SQS_QUEUE_NAME = "publish-events-CODE";
export const SNS_TOPIC_NAMES = [
  "facia-CODE-FrontsUpdateSNSTopic-e2e",
  "facia-CODE-FeastPublicationTopic-e2e",
] as const;

export interface MockConfig {
  name: string;
  fixtureDir: string;
  aliases: string[];
  httpHostPort: number;
  httpsHostPort?: number;
  templating: boolean;
}

export const MOCK_CONFIGS: MockConfig[] = [
  {
    name: "capi",
    fixtureDir: "capi",
    aliases: ["capi.mock"],
    httpHostPort: 9101,
    templating: true,
  },
  {
    name: "ophan",
    fixtureDir: "ophan",
    aliases: ["ophan.mock"],
    httpHostPort: 9102,
    templating: true,
  },
  {
    name: "grid",
    fixtureDir: "grid",
    aliases: ["grid.mock", `grid.${TOOLS_DOMAIN}`],
    httpHostPort: 9103,
    httpsHostPort: 9143,
    templating: true,
  },
  {
    name: "notification",
    fixtureDir: "notification",
    aliases: ["notification.mock"],
    httpHostPort: 9104,
    templating: true,
  },
  {
    name: "recipes",
    fixtureDir: "recipes",
    aliases: [
      "recipes.mock",
      "recipes.guardianapis.com",
      "recipes.code.dev-guardianapis.com",
    ],
    httpHostPort: 9105,
    httpsHostPort: 9145,
    templating: true,
  },
  {
    name: "telemetry",
    fixtureDir: "telemetry",
    aliases: [`user-telemetry.${TOOLS_DOMAIN}`],
    httpHostPort: 9106,
    httpsHostPort: 3133,
    templating: true,
  },
];

export const BROWSER_MOCKS = [
  { hostname: `grid.${TOOLS_DOMAIN}`, httpsHostPort: 9143 },
  { hostname: "recipes.guardianapis.com", httpsHostPort: 9145 },
  { hostname: "recipes.code.dev-guardianapis.com", httpsHostPort: 9145 },
  { hostname: `user-telemetry.${TOOLS_DOMAIN}`, httpsHostPort: 3133 },
] as const;
