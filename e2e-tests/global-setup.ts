import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type LocalStack,
  type StackInfo,
  startLocalStack,
  stopLocalStack,
} from "./setup/stackContainers";
import { readSharedStackInfo } from "./setup/sharedStack";

const e2eRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(e2eRoot, "..");
const activeStackFile = join(e2eRoot, ".active-stack.json");

function writeActiveStack(info: StackInfo): void {
  writeFileSync(activeStackFile, JSON.stringify(info, null, 2));
}

async function globalSetup(): Promise<() => Promise<void>> {
  const shared = readSharedStackInfo(e2eRoot);
  if (shared) {
    writeActiveStack(shared);
    return async () => rmSync(activeStackFile, { force: true });
  }

  if (!process.env.E2E_START_STACK && !process.env.CI) {
    throw new Error(
      "No local stack is running. Start `yarn dev:local` first, or use " +
        "`yarn test:ci` to run the containerised stack.",
    );
  }

  let owned: LocalStack | undefined;
  owned = await startLocalStack({
    appMode: "container",
    e2eRoot,
    repoRoot,
  });
  writeActiveStack(owned.info);

  return async () => {
    rmSync(activeStackFile, { force: true });
    if (owned) await stopLocalStack(owned);
  };
}

export default globalSetup;
