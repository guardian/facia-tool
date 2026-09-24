import { join } from "node:path";
import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import type { MockConfig } from "../constants";

const wiremockHttpPort = 80;
const wiremockHttpsPort = 8443;

export interface StartedMock {
  name: string;
  container: StartedTestContainer;
  adminUrl: string;
}

export async function startMockWiremock(
  config: MockConfig,
  e2eRoot: string,
  network: StartedNetwork,
  streamLogs: boolean,
): Promise<StartedMock> {
  const command = [
    "--root-dir",
    "/home/wiremock",
    "--port",
    String(wiremockHttpPort),
    "--disable-banner",
  ];
  if (config.templating) command.push("--global-response-templating");
  if (config.httpsHostPort) {
    command.push("--https-port", String(wiremockHttpsPort));
  }

  let container = new GenericContainer("wiremock/wiremock:3.9.1")
    .withNetwork(network)
    .withNetworkAliases(...config.aliases)
    .withUser("root")
    .withBindMounts([
      {
        source: join(e2eRoot, "fixtures", config.fixtureDir),
        target: "/home/wiremock",
        mode: "ro",
      },
    ])
    .withCommand(command)
    .withExposedPorts({
      container: wiremockHttpPort,
      host: config.httpHostPort,
    })
    .withWaitStrategy(Wait.forHttp("/__admin/health", wiremockHttpPort))
    .withStartupTimeout(60_000);

  if (config.httpsHostPort) {
    container = container.withExposedPorts({
      container: wiremockHttpsPort,
      host: config.httpsHostPort,
    });
  }
  if (streamLogs) {
    container = container.withLogConsumer((stream) => {
      stream.on("data", (line) =>
        process.stdout.write(`[${config.name}] ${line}`),
      );
    });
  }

  const started = await container.start();
  return {
    name: config.name,
    container: started,
    adminUrl: `http://localhost:${config.httpHostPort}/__admin`,
  };
}
