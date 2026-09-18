import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import {
  APP_CONTAINER_PORT,
  APP_HOSTNAME,
  APP_NETWORK_ALIAS,
  APP_TEST_PORT,
  CI_AUTH_PROXY_PORT,
  PANDA_COOKIE_NAME,
  VITE_PORT,
} from "../constants";

type BindMount = { source: string; target: string; mode: "rw" | "ro" };

function sbtCacheBindMounts(): BindMount[] {
  const mounts: BindMount[] = [];
  const coursier = process.env.DEVENV_COURSIER_CACHE_MOUNT_DIR;
  const ivy = process.env.DEVENV_IVY_CACHE_MOUNT_DIR;
  if (coursier) {
    mounts.push({
      source: coursier,
      target: "/root/.cache/coursier",
      mode: "rw",
    });
  }
  if (ivy) {
    mounts.push({ source: ivy, target: "/root/.ivy2", mode: "rw" });
  }
  return mounts;
}

export async function buildAppImage(e2eRoot: string): Promise<GenericContainer> {
  const context = join(e2eRoot, "target/app-build-context");
  rmSync(context, { recursive: true, force: true });
  mkdirSync(context, { recursive: true });
  copyFileSync(join(e2eRoot, "images/Dockerfile.app"), join(context, "Dockerfile"));
  copyFileSync(
    join(e2eRoot, "images/app.tool-versions"),
    join(context, ".tool-versions"),
  );

  return GenericContainer.fromDockerfile(context)
    .withBuildkit()
    .build("facia-tool-e2e-app:latest", { deleteOnExit: true });
}

export async function startApp(
  image: GenericContainer,
  repoRoot: string,
  network: StartedNetwork,
  streamLogs: boolean,
): Promise<StartedTestContainer> {
  let container = image
    .withNetwork(network)
    .withNetworkAliases(APP_NETWORK_ALIAS)
    .withBindMounts([
      { source: repoRoot, target: "/app", mode: "rw" },
      ...sbtCacheBindMounts(),
    ])
    .withEnvironment({
      FACIA_TOOL_E2E: "true",
      FACIA_TOOL_PROPERTIES_FILE:
        "/app/e2e-tests/fixtures/app-config/facia-tool.properties",
      FACIA_TOOL_E2E_PERMISSIONS_FILE:
        "/app/e2e-tests/fixtures/permissions/e2e-permissions.json",
      FACIA_TOOL_E2E_CONFIG:
        "/app/e2e-tests/fixtures/app-config/application.container.conf",
      AWS_ACCESS_KEY_ID: "test",
      AWS_SECRET_ACCESS_KEY: "test",
      AWS_REGION: "eu-west-1",
      AWS_DEFAULT_REGION: "eu-west-1",
      AWS_EC2_METADATA_DISABLED: "true",
      AWS_JAVA_V1_DISABLE_DEPRECATION_ANNOUNCEMENT: "true",
      AWS_SHARED_CREDENTIALS_FILE:
        "/app/e2e-tests/fixtures/app-config/aws-credentials",
      AWS_CONFIG_FILE: "/app/e2e-tests/fixtures/app-config/aws-config",
    })
    .withExposedPorts(
      { container: APP_CONTAINER_PORT, host: APP_TEST_PORT },
      { container: VITE_PORT, host: VITE_PORT },
    )
    .withWaitStrategy(
      Wait.forHttp("/_healthcheck", APP_CONTAINER_PORT).forStatusCode(200),
    )
    .withStartupTimeout(600_000);

  if (streamLogs) {
    container = container.withLogConsumer((stream) => {
      stream.on("data", (line) => process.stdout.write(`[app] ${line}`));
    });
  }

  return container.start();
}

export async function startTestAuthProxy(
  network: StartedNetwork,
  cookieValue: string,
): Promise<StartedTestContainer> {
  const config = `server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://${APP_NETWORK_ALIAS}:${APP_CONTAINER_PORT};
        proxy_set_header Host ${APP_HOSTNAME};
        proxy_set_header Cookie "${PANDA_COOKIE_NAME}=${cookieValue}";
        proxy_set_header Origin "https://${APP_HOSTNAME}";
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
`;

  return new GenericContainer("nginx:alpine")
    .withNetwork(network)
    .withCopyContentToContainer([
      { content: config, target: "/etc/nginx/conf.d/default.conf" },
    ])
    .withExposedPorts({ container: 80, host: CI_AUTH_PROXY_PORT })
    .withWaitStrategy(Wait.forListeningPorts())
    .withStartupTimeout(30_000)
    .start();
}
