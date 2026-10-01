import {
  GenericContainer,
  Wait,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import { stackLabel } from "./infrastructure.js";
import type { StartedMock } from "./types.js";

interface MockConfig {
  name: string;
  aliases: string[];
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
];

async function startMock(
  config: MockConfig,
  network: StartedNetwork,
  runId: string,
): Promise<StartedTestContainer> {
  return new GenericContainer("wiremock/wiremock:3.13.1")
    .withLabels({ [stackLabel]: runId, "facia-tool-e2e.mock": config.name })
    .withNetwork(network)
    .withNetworkAliases(...config.aliases)
    .withExposedPorts(8080)
    .withCommand(["--disable-banner", "--verbose"])
    .withWaitStrategy(Wait.forHttp("/__admin/health", 8080))
    .withStartupTimeout(120_000)
    .start();
}

export async function startMocks(
  network: StartedNetwork,
  runId: string,
): Promise<StartedMock[]> {
  const results = await Promise.allSettled(
    mockConfigs.map(async (config) => ({
      name: config.name,
      container: await startMock(config, network, runId),
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