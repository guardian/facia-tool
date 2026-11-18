import type { ChildProcess } from "node:child_process";
import type { StartedNetwork, StartedTestContainer } from "testcontainers";

export type AppMode = "container" | "native";

export interface StackConnection {
  baseUrl: string;
  localStackEndpoint: string;
  authCookieName: string;
  panDomainPrivateKey: string;
}

export interface StackInfrastructure {
  network: StartedNetwork;
  postgres: StartedTestContainer;
  localstack: StartedTestContainer;
}

export interface RuntimeConfig {
  applicationConfigPath: string;
  propertiesPath: string;
  environment: Record<string, string>;
}

export interface StartedMock {
  name: string;
  container: StartedTestContainer;
}

export interface NativeApp {
  processes: ChildProcess[];
}

export interface LocalStack extends StackInfrastructure {
  authRedirect: StartedTestContainer;
  app?: StartedTestContainer;
  nativeApp?: NativeApp;
  mocks: StartedMock[];
  connection: StackConnection;
  runId: string;
}
