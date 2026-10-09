import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const e2eRoot = resolve(import.meta.dirname, "..");
const featuresRoot = join(e2eRoot, "features");

function containsFeatureFile(directory: string): boolean {
  if (!existsSync(directory)) {
    return false;
  }

  return readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory()
      ? containsFeatureFile(entryPath)
      : entry.name.endsWith(".feature");
  });
}

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    cwd: e2eRoot,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!containsFeatureFile(featuresRoot)) {
  console.log("No tests");
  process.exit(0);
}

run("yarn", ["bddgen"]);
run("yarn", ["playwright", "test", ...process.argv.slice(2)]);