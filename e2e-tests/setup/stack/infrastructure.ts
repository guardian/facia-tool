import {
  GenericContainer,
  Network,
  Wait,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import type { StackInfrastructure } from "./types.js";

export const stackLabel = "com.guardian.facia-tool.e2e";

async function startPostgres(
  network: StartedNetwork,
  runId: string,
): Promise<StartedTestContainer> {
  return new GenericContainer("postgres:17-alpine")
    .withLabels({ [stackLabel]: runId })
    .withNetwork(network)
    .withNetworkAliases("postgres")
    .withEnvironment({
      POSTGRES_USER: "faciatool",
      POSTGRES_PASSWORD: "faciatool",
      POSTGRES_DB: "faciatool",
    })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage(/database system is ready to accept connections/, 2),
    )
    .withStartupTimeout(120_000)
    .start();
}

async function startLocalstack(
  network: StartedNetwork,
  runId: string,
): Promise<StartedTestContainer> {
  return new GenericContainer("localstack/localstack:4.9.2")
    .withLabels({ [stackLabel]: runId })
    .withNetwork(network)
    .withNetworkAliases(
      "localstack",
      "s3.localstack",
      "facia-switches.localstack",
      "facia-tool-store-local.localstack",
      "pan-domain-auth-settings.localstack",
      "permissions-cache.localstack",
      "preview-editions-e2e.localstack",
      "published-editions-e2e.localstack",
      "facia-switches.s3.localstack",
      "facia-tool-store-local.s3.localstack",
      "pan-domain-auth-settings.s3.localstack",
      "permissions-cache.s3.localstack",
      "preview-editions-e2e.s3.localstack",
      "published-editions-e2e.s3.localstack",
    )
    .withEnvironment({
      SERVICES: "s3,dynamodb,sqs,sns,sts,cloudwatch",
      AWS_DEFAULT_REGION: "eu-west-1",
      EAGER_SERVICE_LOADING: "1",
    })
    .withExposedPorts(4566)
    .withWaitStrategy(Wait.forLogMessage(/Ready\./))
    .withStartupTimeout(180_000)
    .start();
}

export async function startInfrastructure(
  runId: string,
): Promise<StackInfrastructure> {
  const network = await new Network().start();
  const results = await Promise.allSettled([
    startPostgres(network, runId),
    startLocalstack(network, runId),
  ]);
  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failure) {
    await Promise.all(
      results
        .filter(
          (result): result is PromiseFulfilledResult<StartedTestContainer> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value.stop().catch(() => undefined)),
    );
    await network.stop().catch(() => undefined);
    throw failure.reason;
  }

  const [postgres, localstack] = results.map(
    (result) => (result as PromiseFulfilledResult<StartedTestContainer>).value,
  );
  return { network, postgres, localstack };
}