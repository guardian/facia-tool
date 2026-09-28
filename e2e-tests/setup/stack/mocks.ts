import {
  GenericContainer,
  Wait,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import { join } from "node:path";
import { stackLabel } from "./infrastructure.js";
import type { StartedMock } from "./types.js";

interface MockConfig {
  name: string;
  aliases: string[];
  httpsHostPort?: number;
}

const mockConfigs: MockConfig[] = [
  {
    name: "content-api",
    aliases: ["content.guardianapis.com", "preview.content.guardianapis.com"],
  },
  { name: "ophan", aliases: ["api.ophan.co.uk"] },
  { name: "recipes", aliases: ["recipes.guardianapis.com"] },
  {
    name: "grid",
    aliases: ["api.media.local.dev-gutools.co.uk"],
  },
  {
    name: "mobile-notifications",
    aliases: ["mobile-notifications.local.dev-gutools.co.uk"],
  },
  {
    name: "pan-domain-auth",
    aliases: ["pan-domain-auth.local.dev-gutools.co.uk"],
  },
  {
    name: "video",
    aliases: ["video.local.dev-gutools.co.uk"],
  },
  {
    name: "telemetry",
    aliases: ["user-telemetry.local.dev-gutools.co.uk"],
    httpsHostPort: 3133,
  },
  {
    name: "pinboard",
    aliases: ["pinboard.local.dev-gutools.co.uk"],
  },
];

async function startMock(
  config: MockConfig,
  e2eRoot: string,
  network: StartedNetwork,
  runId: string,
): Promise<StartedTestContainer> {
  const container = new GenericContainer("wiremock/wiremock:3.13.1")
    .withLabels({ [stackLabel]: runId, "facia-tool-e2e.mock": config.name })
    .withNetwork(network)
    .withNetworkAliases(...config.aliases)
    .withBindMounts([
      {
        source: join(e2eRoot, "fixtures", "wiremock", config.name),
        target: "/fixtures",
        mode: "ro",
      },
    ])
    .withCommand([
      "--root-dir",
      "/fixtures",
      "--disable-banner",
      "--verbose",
      ...(config.httpsHostPort ? ["--https-port", "8443"] : []),
    ])
    .withWaitStrategy(Wait.forHttp("/__admin/health", 8080))
    .withStartupTimeout(120_000);

  if (config.httpsHostPort) {
    container.withExposedPorts(8080, {
      container: 8443,
      host: config.httpsHostPort,
    });
  } else {
    container.withExposedPorts(8080);
  }
  return container.start();
}

export async function startMocks(
  e2eRoot: string,
  network: StartedNetwork,
  runId: string,
): Promise<StartedMock[]> {
  const results = await Promise.allSettled(
    mockConfigs.map(async (config) => ({
      name: config.name,
      container: await startMock(config, e2eRoot, network, runId),
    })),
  );
  const started = results
    .filter(
      (result): result is PromiseFulfilledResult<StartedMock> =>
        result.status === "fulfilled",
    )
    .map(({ value }) => value);
  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failure) {
    await Promise.all(
      started.map(({ container }) => container.stop().catch(() => undefined)),
    );
    throw failure.reason;
  }
  return started;
}