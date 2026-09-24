import {
  Network,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import {
  APP_HEALTH_URL,
  CI_APP_BASE_URL,
  LOCAL_APP_BASE_URL,
  MOCK_CONFIGS,
} from "./constants";
import { generatePanDomainKeys, type PanDomainKeys } from "./panDomainKeys";
import { createPanDomainCookie } from "./panDomainCookie";
import { buildAppImage, startApp, startTestAuthProxy } from "./stack/app";
import { seedAws, startAws } from "./stack/localstack";
import { startDb } from "./stack/postgres";
import { startMockWiremock } from "./stack/wiremock";

export interface StackInfo {
  baseUrl: string;
  healthUrl: string;
  privateKeyPem: string;
  cookieDomain: string;
  mockAdminUrls: Record<string, string>;
}

export interface LocalStack {
  info: StackInfo;
  keys: PanDomainKeys;
  network: StartedNetwork;
  containers: StartedTestContainer[];
}

export interface StartOptions {
  appMode: "container" | "external";
  streamLogs?: boolean;
  repoRoot: string;
  e2eRoot: string;
}

export async function startLocalStack(options: StartOptions): Promise<LocalStack> {
  const streamLogs = options.streamLogs ?? false;
  const keys = generatePanDomainKeys();
  const network = await new Network().start();
  const started: StartedTestContainer[] = [];

  try {
    const [aws, db] = await Promise.all([
      startAws(network, streamLogs),
      startDb(network, streamLogs),
    ]);
    started.push(aws, db);
    await seedAws(options.e2eRoot, keys);

    const mockStarts = MOCK_CONFIGS.map((config) =>
      startMockWiremock(config, options.e2eRoot, network, streamLogs),
    );
    const appStart =
      options.appMode === "container"
        ? buildAppImage(options.e2eRoot).then((image) =>
            startApp(
              image,
              options.repoRoot,
              network,
              streamLogs,
            ),
          )
        : Promise.resolve(undefined);

    const [mockResults, appResult] = await Promise.all([
      Promise.allSettled(mockStarts),
      appStart.then(
        (value) => ({ status: "fulfilled" as const, value }),
        (reason: unknown) => ({ status: "rejected" as const, reason }),
      ),
    ]);
    const mocks = mockResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    started.push(...mocks.map(({ container }) => container));
    if (appResult.status === "fulfilled" && appResult.value) {
      started.push(appResult.value);
      const cookie = createPanDomainCookie("default", keys.privateKeyPem, "localhost");
      started.push(await startTestAuthProxy(network, cookie.value));
    }
    const startupFailure =
      mockResults.find((result) => result.status === "rejected") ??
      (appResult.status === "rejected" ? appResult : undefined);
    if (startupFailure?.status === "rejected") throw startupFailure.reason;

    return {
      keys,
      network,
      containers: started,
      info: {
        baseUrl:
          options.appMode === "container"
            ? CI_APP_BASE_URL
            : LOCAL_APP_BASE_URL,
        healthUrl: APP_HEALTH_URL,
        privateKeyPem: keys.privateKeyPem,
        cookieDomain: "localhost",
        mockAdminUrls: Object.fromEntries(
          mocks.map(({ name, adminUrl }) => [name, adminUrl]),
        ),
      },
    };
  } catch (error) {
    await Promise.allSettled(started.reverse().map((container) => container.stop()));
    await network.stop();
    throw error;
  }
}

export async function stopLocalStack(stack: LocalStack): Promise<void> {
  await Promise.allSettled(
    stack.containers.reverse().map((container) => container.stop()),
  );
  await stack.network.stop();
}
