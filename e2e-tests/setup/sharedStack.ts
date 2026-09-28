import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { StackConnection } from "./stack/types.js";

export const ACTIVE_STACK_FILE = join(
  import.meta.dirname,
  "..",
  "target",
  "active-stack.json",
);
export const SHARED_STACK_FILE = join(
  import.meta.dirname,
  "..",
  "target",
  "shared-stack.json",
);

export function readStackConnection(file: string): StackConnection | undefined {
  if (!existsSync(file)) {
    return undefined;
  }
  return JSON.parse(readFileSync(file, "utf8")) as StackConnection;
}

export function writeStackConnection(
  file: string,
  connection: StackConnection,
): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(connection, null, 2)}\n`);
}

export function removeStackConnection(file: string): void {
  rmSync(file, { force: true });
}