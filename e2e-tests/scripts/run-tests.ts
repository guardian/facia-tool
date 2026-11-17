import {
  existsSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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

async function configureLocalBrowser(): Promise<void> {
  if (
    process.platform === "linux" &&
    process.arch === "arm64" &&
    !process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const cacheMarker = join(tmpdir(), "chromium-arm64-v143.0.4");
    if (!existsSync(cacheMarker)) {
      for (const path of [
        "chromium",
        "chromium-pack",
        "al2023",
        "fonts",
        "swiftshader",
      ]) {
        rmSync(join(tmpdir(), path), { force: true, recursive: true });
      }
    }
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH =
      await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.arm64.tar",
      );
    writeFileSync(cacheMarker, "");
  }
}

if (!containsFeatureFile(featuresRoot)) {
  console.log("No tests");
  process.exit(0);
}

await configureLocalBrowser();
run("yarn", ["bddgen"]);
run("yarn", ["playwright", "test", ...process.argv.slice(2)]);