import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  GenericContainer,
  Wait,
  type StartedNetwork,
  type StartedTestContainer,
} from "testcontainers";
import { stackLabel } from "./infrastructure.js";
import { sbtCacheBindMounts } from "./sbt-cache.js";
import type { RuntimeConfig } from "./types.js";

interface StartAppOptions {
  e2eRoot: string;
  repoRoot: string;
  network: StartedNetwork;
  runId: string;
  runtimeConfig: RuntimeConfig;
}

async function buildAppImage(
  e2eRoot: string,
  repoRoot: string,
  runId: string,
): Promise<GenericContainer> {
  const context = join(e2eRoot, "target", "app-build-context");
  rmSync(context, { force: true, recursive: true });
  mkdirSync(context, { recursive: true });
  copyFileSync(join(repoRoot, ".tool-versions"), join(context, ".tool-versions"));
  copyFileSync(
    join(e2eRoot, "images", "facia-tool.Dockerfile"),
    join(context, "Dockerfile"),
  );

  return GenericContainer.fromDockerfile(context)
    .withBuildkit()
    .build(`facia-tool-e2e:${runId}`, { deleteOnExit: true });
}

export async function startAppContainer({
  e2eRoot,
  repoRoot,
  network,
  runId,
  runtimeConfig,
}: StartAppOptions): Promise<StartedTestContainer> {
  const image = await buildAppImage(e2eRoot, repoRoot, runId);
  return image
    .withLabels({ [stackLabel]: runId })
    .withNetwork(network)
    .withNetworkAliases("facia-tool")
    .withBindMounts([
      { source: repoRoot, target: "/workspace", mode: "rw" },
      ...sbtCacheBindMounts(),
    ])
    .withEnvironment(runtimeConfig.environment)
    .withWorkingDir("/workspace")
    .withLogConsumer((stream) => {
      stream.on("data", (chunk) => process.stdout.write(`[app] ${chunk}`));
      stream.on("err", (chunk) => process.stderr.write(`[app] ${chunk}`));
    })
    .withCommand([
      "bash",
      "-c",
      `cd /workspace/fronts-client && yarn install --frozen-lockfile && yarn watch & exec sbt -Dconfig.file=${runtimeConfig.applicationConfigPath} "run 9000"`,
    ])
    .withExposedPorts(9000, { container: 5173, host: 5173 })
    .withWaitStrategy(
      Wait.forHttp("/_healthcheck", 9000).forStatusCode(200),
    )
    .withStartupTimeout(600_000)
    .start();
}