import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const e2eRoot = resolve(import.meta.dirname, "..");
const requiredFiles = [
  ".gitignore",
  ".tool-versions",
  "global-setup.ts",
  "package.json",
  "playwright.config.ts",
  "setup/run-dev-local.ts",
  "tsconfig.json",
  "yarn.lock",
];
const requiredScripts = [
  "bddgen",
  "dev",
  "dev:local",
  "test",
  "test:ci",
  "test:report",
  "test:ui",
  "typecheck",
];

const missingFiles = requiredFiles.filter(
  (file) => !existsSync(resolve(e2eRoot, file)),
);
if (missingFiles.length > 0) {
  throw new Error(`Missing scaffold files: ${missingFiles.join(", ")}`);
}

const packageJson = JSON.parse(
  readFileSync(resolve(e2eRoot, "package.json"), "utf8"),
) as { packageManager?: string; scripts?: Record<string, string> };
if (!packageJson.packageManager?.startsWith("yarn@")) {
  throw new Error("package.json must pin Yarn as its package manager");
}

const missingScripts = requiredScripts.filter(
  (script) => !packageJson.scripts?.[script],
);
if (missingScripts.length > 0) {
  throw new Error(`Missing package scripts: ${missingScripts.join(", ")}`);
}

const toolVersions = readFileSync(
  resolve(e2eRoot, ".tool-versions"),
  "utf8",
);
if (!/^nodejs 22\./m.test(toolVersions) || !/^yarn 1\.22\./m.test(toolVersions)) {
  throw new Error(".tool-versions must pin Node 22 and Yarn 1.22");
}

for (const runtimePath of [".features-gen", "node_modules", "target"]) {
  const ignored = spawnSync("git", ["check-ignore", "--quiet", runtimePath], {
    cwd: e2eRoot,
  });
  if (ignored.status !== 0) {
    throw new Error(`${runtimePath} must be ignored by Git`);
  }
}

console.log("Scaffold validation passed");