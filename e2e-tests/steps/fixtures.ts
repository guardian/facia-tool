import { expect } from "@playwright/test";
import { createBdd, test as base } from "playwright-bdd";
import {
  ACTIVE_STACK_FILE,
  readStackConnection,
} from "../setup/sharedStack.js";
import type { StackConnection } from "../setup/stack/types.js";

interface Fixtures {
  stack: StackConnection;
}

export const test = base.extend<Fixtures>({
  stack: async ({}, use) => {
    const connection = readStackConnection(ACTIVE_STACK_FILE);
    if (!connection) {
      throw new Error("Playwright global setup did not write a stack connection");
    }
    await use(connection);
  },
});

export const { Given, When, Then } = createBdd(test);
export { expect };