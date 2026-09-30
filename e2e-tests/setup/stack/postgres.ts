import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import {
  DB_NETWORK_ALIAS,
  POSTGRES_DB,
  POSTGRES_HOST_PORT,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from "../constants";

export async function startDb(
  network: StartedNetwork,
  streamLogs: boolean,
): Promise<StartedTestContainer> {
  let container = new GenericContainer("postgres:10.7-alpine")
    .withNetwork(network)
    .withNetworkAliases(DB_NETWORK_ALIAS)
    .withEnvironment({
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DB,
    })
    .withExposedPorts({
      container: POSTGRES_PORT,
      host: POSTGRES_HOST_PORT,
    })
    .withWaitStrategy(
      Wait.forLogMessage(/database system is ready to accept connections/, 2),
    )
    .withStartupTimeout(60_000);

  if (streamLogs) {
    container = container.withLogConsumer((stream) => {
      stream.on("data", (line) => process.stdout.write(`[postgres] ${line}`));
    });
  }

  return container.start();
}
