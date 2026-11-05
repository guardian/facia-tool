import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import {
  authCookieName,
  createE2eAuthCookie,
  generatePanDomainKeys,
} from "./panDomain.js";
import { bootstrapAws } from "./stack/bootstrap.js";
import { startAppContainer } from "./stack/app-container.js";
import { startAuthRedirect } from "./stack/auth-redirect.js";
import { startInfrastructure } from "./stack/infrastructure.js";
import { startMocks } from "./stack/mocks.js";
import { startNativeApp, stopNativeApp } from "./stack/native-app.js";
import { writeRuntimeConfig } from "./stack/runtime-config.js";
import type {
  AppMode,
  LocalStack,
  NativeApp,
  StartedMock,
} from "./stack/types.js";
import type { StartedTestContainer } from "testcontainers";

export interface StartLocalStackOptions {
  appMode?: AppMode;
}

export async function startLocalStack(
  options: StartLocalStackOptions = {},
): Promise<LocalStack> {
  const appMode = options.appMode ?? "container";
  const e2eRoot = resolve(import.meta.dirname, "..");
  const repoRoot = resolve(e2eRoot, "..");
  const runId = randomUUID();
  const panDomainKeys = generatePanDomainKeys();
  const authCookie = createE2eAuthCookie(panDomainKeys.privateKeyPem);
  const infrastructure = await startInfrastructure(runId);
  let mocks: StartedMock[] = [];
  let app: StartedTestContainer | undefined;
  let authRedirect: StartedTestContainer | undefined;
  let nativeApp: NativeApp | undefined;

  try {
    const hostAwsEndpoint = `http://${infrastructure.localstack.getHost()}:${infrastructure.localstack.getMappedPort(4566)}`;
    await bootstrapAws(hostAwsEndpoint, e2eRoot, panDomainKeys);
    if (appMode === "container") {
      const runtimeConfig = writeRuntimeConfig({
        e2eRoot,
        repoRoot,
        mode: appMode,
        postgres: infrastructure.postgres,
        localstack: infrastructure.localstack,
        mocks: [],
      });
      const [mocksResult, appResult] = await Promise.allSettled([
        startMocks(e2eRoot, infrastructure.network, runId),
        startAppContainer({
          e2eRoot,
          repoRoot,
          network: infrastructure.network,
          runId,
          runtimeConfig,
        }),
      ]);
      if (mocksResult.status === "fulfilled") {
        mocks = mocksResult.value;
      }
      if (appResult.status === "fulfilled") {
        app = appResult.value;
      }
      const failure = [mocksResult, appResult].find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );
      if (failure) {
        throw failure.reason;
      }
    } else {
      mocks = await startMocks(e2eRoot, infrastructure.network, runId);
      const runtimeConfig = writeRuntimeConfig({
        e2eRoot,
        repoRoot,
        mode: appMode,
        postgres: infrastructure.postgres,
        localstack: infrastructure.localstack,
        mocks,
      });
      nativeApp = await startNativeApp({ repoRoot, runtimeConfig });
    }

    authRedirect = await startAuthRedirect(
      e2eRoot,
      infrastructure.network,
      runId,
      appMode,
      authCookie,
    );

    return {
      ...infrastructure,
      authRedirect,
      app,
      nativeApp,
      mocks,
      connection: {
        baseUrl: `http://${authRedirect.getHost()}:${authRedirect.getMappedPort(80)}`,
        localStackEndpoint: hostAwsEndpoint,
        authCookieName,
        panDomainPrivateKey: panDomainKeys.privateKeyPem,
      },
      runId,
    };
  } catch (error) {
    await authRedirect?.stop().catch(() => undefined);
    if (nativeApp) {
      await stopNativeApp(nativeApp);
    }
    await app?.stop().catch(() => undefined);
    await Promise.all(
      [...mocks]
        .reverse()
        .map(({ container }) => container.stop().catch(() => undefined)),
    );
    await infrastructure.localstack.stop().catch(() => undefined);
    await infrastructure.postgres.stop().catch(() => undefined);
    await infrastructure.network.stop().catch(() => undefined);
    throw error;
  }
}

export async function stopLocalStack(stack: LocalStack): Promise<void> {
  await stack.authRedirect.stop().catch(() => undefined);
  if (stack.nativeApp) {
    await stopNativeApp(stack.nativeApp);
  }
  await stack.app?.stop().catch(() => undefined);
  await Promise.all(
    [...stack.mocks]
      .reverse()
      .map(({ container }) => container.stop().catch(() => undefined)),
  );
  await stack.localstack.stop().catch(() => undefined);
  await stack.postgres.stop().catch(() => undefined);
  await stack.network.stop().catch(() => undefined);
}
