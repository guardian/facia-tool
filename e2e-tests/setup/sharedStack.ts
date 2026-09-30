import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { StackInfo } from "./stackContainers";

function sharedStackFile(e2eRoot: string): string {
  return join(e2eRoot, ".dev-local-stack.json");
}

export function writeSharedStackInfo(e2eRoot: string, info: StackInfo): void {
  writeFileSync(sharedStackFile(e2eRoot), JSON.stringify(info, null, 2));
}

export function readSharedStackInfo(e2eRoot: string): StackInfo | undefined {
  const path = sharedStackFile(e2eRoot);
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8")) as StackInfo;
}

export function clearSharedStackInfo(e2eRoot: string): void {
  rmSync(sharedStackFile(e2eRoot), { force: true });
}