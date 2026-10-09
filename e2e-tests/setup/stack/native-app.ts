import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { nativeAppPort } from "./auth-redirect.js";
import type { NativeApp, RuntimeConfig } from "./types.js";

interface StartNativeAppOptions {
  repoRoot: string;
  runtimeConfig: RuntimeConfig;
}

function startProcess(
  name: string,
  command: string,
  args: string[],
  cwd: string,
  environment: Record<string, string>,
): ChildProcess {
  const child = spawn(command, args, {
    cwd,
    detached: true,
    env: { ...process.env, ...environment },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk) =>
    process.stdout.write(`[${name}] ${chunk}`),
  );
  child.stderr?.on("data", (chunk) =>
    process.stderr.write(`[${name}] ${chunk}`),
  );
  return child;
}

async function waitForHealth(
  url: string,
  appProcess: ChildProcess,
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (appProcess.exitCode !== null) {
      throw new Error(`Native app exited with code ${appProcess.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Native app healthcheck timed out at ${url}`);
}

export async function startNativeApp({
  repoRoot,
  runtimeConfig,
}: StartNativeAppOptions): Promise<NativeApp> {
  const vite = startProcess(
    "vite",
    "yarn",
    ["watch"],
    join(repoRoot, "fronts-client"),
    runtimeConfig.environment,
  );
  const app = startProcess(
    "app",
    "sbt",
    [
      `-Dconfig.file=${runtimeConfig.applicationConfigPath}`,
      `run ${nativeAppPort}`,
    ],
    repoRoot,
    runtimeConfig.environment,
  );
  const nativeApp = { processes: [app, vite] };

  try {
    await waitForHealth(
      `http://localhost:${nativeAppPort}/_healthcheck`,
      app,
      300_000,
    );
    return nativeApp;
  } catch (error) {
    await stopNativeApp(nativeApp);
    throw error;
  }
}

export async function stopNativeApp(nativeApp: NativeApp): Promise<void> {
  for (const child of [...nativeApp.processes].reverse()) {
    if (child.pid && child.exitCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {}
    }
  }
  await Promise.all(
    nativeApp.processes.map(
      (child) =>
        new Promise<void>((resolve) => {
          if (child.exitCode !== null) {
            resolve();
            return;
          }
          child.once("exit", () => resolve());
          setTimeout(resolve, 5_000);
        }),
    ),
  );
}
