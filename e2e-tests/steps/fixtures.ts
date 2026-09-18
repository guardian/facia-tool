import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "@playwright/test";
import { createBdd, test as base } from "playwright-bdd";
import { createPanDomainCookie, type Role } from "../setup/panDomainCookie";
import type { StackInfo } from "../setup/stackContainers";

const e2eRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const activeStackFile = join(e2eRoot, ".active-stack.json");

function readStackInfo(): StackInfo {
  return JSON.parse(readFileSync(activeStackFile, "utf8")) as StackInfo;
}

type Fixtures = {
  stackInfo: StackInfo;
  signIn: (role: Role) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  stackInfo: async ({}, use) => {
    await use(readStackInfo());
  },
  signIn: async ({ context, stackInfo }, use) => {
    await use(async (role: Role) => {
      await context.addCookies([
        createPanDomainCookie(
          role,
          stackInfo.privateKeyPem,
          stackInfo.cookieDomain,
        ),
      ]);
    });
  },
});

export const { Given, When, Then } = createBdd(test);
export { expect };
