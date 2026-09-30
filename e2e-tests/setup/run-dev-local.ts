import { type ChildProcess, spawn } from "node:child_process";
import { createServer, request } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_HOSTNAME,
  APP_TEST_PORT,
  AUTH_PROXY_PORT,
  PANDA_COOKIE_NAME,
  TOOLS_DOMAIN,
} from "./constants";
import { createPanDomainCookie } from "./panDomainCookie";
import { clearSharedStackInfo, writeSharedStackInfo } from "./sharedStack";
import {
  type LocalStack,
  startLocalStack,
  stopLocalStack,
} from "./stackContainers";

const e2eRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(e2eRoot, "..");

function e2eEnvironment(): NodeJS.ProcessEnv {
  const environment = { ...process.env };
  delete environment.AWS_PROFILE;
  delete environment.AWS_SESSION_TOKEN;
  Object.assign(environment, {
    FACIA_TOOL_E2E: "true",
    FACIA_TOOL_PROPERTIES_FILE: join(
      e2eRoot,
      "fixtures/app-config/facia-tool.properties",
    ),
    AWS_ENDPOINT_URL_S3: "http://s3.localhost.localstack.cloud:4567",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    AWS_REGION: "eu-west-1",
    AWS_DEFAULT_REGION: "eu-west-1",
    AWS_EC2_METADATA_DISABLED: "true",
    AWS_JAVA_V1_DISABLE_DEPRECATION_ANNOUNCEMENT: "true",
    AWS_SHARED_CREDENTIALS_FILE: join(
      e2eRoot,
      "fixtures/app-config/aws-credentials",
    ),
    AWS_CONFIG_FILE: join(e2eRoot, "fixtures/app-config/aws-config"),
  });
  return environment;
}

function startNativeProcesses(): ChildProcess[] {
  const environment = e2eEnvironment();
  const config = join(
    e2eRoot,
    "fixtures/app-config/application.native.conf",
  );
  const play = spawn(
    "mise",
    ["x", "--", "sbt", `-Dconfig.file=${config}`, `run ${APP_TEST_PORT}`],
    { cwd: repoRoot, env: environment, stdio: "inherit" },
  );
  const vite = spawn(
    "mise",
    ["x", "--", "yarn", "watch", "--host", "0.0.0.0"],
    {
      cwd: join(repoRoot, "fronts-client"),
      env: environment,
      stdio: "inherit",
    },
  );
  return [play, vite];
}

async function waitForApp(): Promise<void> {
  const deadline = Date.now() + 600_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${APP_TEST_PORT}/_healthcheck`);
      if (response.ok) return;
    } catch {
      // Play is still compiling or starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Timed out waiting for the native Play server");
}

async function startAuthProxy(cookieValue: string) {
  const server = createServer((incoming, outgoing) => {
    if (incoming.url === "/cookie") {
      outgoing.writeHead(302, {
        Location: "/",
        "Set-Cookie": `${PANDA_COOKIE_NAME}=${cookieValue}; Path=/; Domain=${TOOLS_DOMAIN}; Secure; SameSite=Lax`,
      });
      outgoing.end();
      return;
    }

    const upstream = request(
      {
        hostname: "127.0.0.1",
        port: APP_TEST_PORT,
        path: incoming.url,
        method: incoming.method,
        headers: {
          ...incoming.headers,
          host: APP_HOSTNAME,
          cookie: `${PANDA_COOKIE_NAME}=${cookieValue}`,
          origin: `https://${APP_HOSTNAME}`,
          "x-forwarded-proto": "https",
        },
      },
      (response) => {
        outgoing.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(outgoing);
      },
    );
    upstream.on("error", (error) => {
      outgoing.writeHead(502);
      outgoing.end(error.message);
    });
    incoming.pipe(upstream);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(AUTH_PROXY_PORT, "0.0.0.0", resolve);
  });
  return server;
}

async function main(): Promise<void> {
  let stack: LocalStack | undefined;
  let children: ChildProcess[] = [];
  let proxy: Awaited<ReturnType<typeof startAuthProxy>> | undefined;
  let stopping = false;

  const stop = async (exitCode = 0) => {
    if (stopping) return;
    stopping = true;
    clearSharedStackInfo(e2eRoot);
    await new Promise<void>((resolve) => proxy?.close(() => resolve()) ?? resolve());
    for (const child of children) child.kill("SIGTERM");
    if (stack) await stopLocalStack(stack);
    process.exit(exitCode);
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());

  try {
    stack = await startLocalStack({
      appMode: "external",
      e2eRoot,
      repoRoot,
      streamLogs: true,
    });
    children = startNativeProcesses();
    await waitForApp();
    const cookie = createPanDomainCookie(
      "default",
      stack.keys.privateKeyPem,
      TOOLS_DOMAIN,
      7 * 24 * 60 * 60 * 1000,
    );
    proxy = await startAuthProxy(cookie.value);
    writeSharedStackInfo(e2eRoot, stack.info);

    console.log(`App ready: https://${APP_HOSTNAME}/cookie`);
    console.log("Run `yarn test` or `yarn test:ui` in another terminal.");
    await new Promise<void>(() => undefined);
  } catch (error) {
    console.error(error);
    await stop(1);
  }
}

void main();
