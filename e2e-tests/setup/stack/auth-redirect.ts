import { join } from "node:path";
import {
  GenericContainer,
  TestContainers,
  Wait,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import { authCookieName } from "../panDomain.js";
import { stackLabel } from "./infrastructure.js";
import type { AppMode } from "./types.js";

export const nativeAppPort = 9001;

export async function startAuthRedirect(
  e2eRoot: string,
  network: StartedNetwork,
  runId: string,
  appMode: AppMode,
  authCookie: string,
): Promise<StartedTestContainer> {
  if (appMode === "native") {
    await TestContainers.exposeHostPorts(nativeAppPort);
  }
  return new GenericContainer("nginx:1.28-alpine")
    .withLabels({ [stackLabel]: runId })
    .withNetwork(network)
    .withNetworkAliases("auth-redirect")
    .withCopyFilesToContainer([
      {
        source: join(
          e2eRoot,
          "fixtures",
          "auth-redirect",
          "default.conf.template",
        ),
        target: "/etc/nginx/templates/default.conf.template",
      },
    ])
    .withEnvironment({
      E2E_AUTH_COOKIE_NAME: authCookieName,
      E2E_AUTH_COOKIE: authCookie,
      E2E_APP_UPSTREAM:
        appMode === "container"
          ? "facia-tool:9000"
          : `host.testcontainers.internal:${nativeAppPort}`,
      NGINX_ENVSUBST_FILTER: "^E2E_",
    })
    .withExposedPorts(appMode === "native" ? { container: 80, host: 9000 } : 80)
    .withWaitStrategy(Wait.forHttp("/_healthcheck", 80).forStatusCode(200))
    .withStartupTimeout(120_000)
    .start();
}
