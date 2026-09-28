import {
	startLocalStack,
	stopLocalStack,
} from "./setup/stackContainers.js";
import {
	ACTIVE_STACK_FILE,
	SHARED_STACK_FILE,
	readStackConnection,
	removeStackConnection,
	writeStackConnection,
} from "./setup/sharedStack.js";
import type { AppMode } from "./setup/stack/types.js";

export default async function globalSetup(): Promise<() => Promise<void>> {
	const forceOwnedStack = process.env.E2E_FORCE_OWNED_STACK === "true";
	const shared = forceOwnedStack
		? undefined
		: readStackConnection(SHARED_STACK_FILE);
	if (shared) {
		const response = await fetch(`${shared.baseUrl}/_healthcheck`).catch(
			() => undefined,
		);
		if (!response?.ok) {
			throw new Error(
				"The shared local stack is stale; remove e2e-tests/target/shared-stack.json and restart dev:local",
			);
		}
		writeStackConnection(ACTIVE_STACK_FILE, shared);
		return async () => removeStackConnection(ACTIVE_STACK_FILE);
	}

	if (!forceOwnedStack && process.env.E2E_START_STACK !== "true") {
		throw new Error("No local e2e stack is running; start it with yarn dev:local");
	}

	const appMode = (process.env.E2E_APP_MODE ?? "container") as AppMode;
	const ownedStack = await startLocalStack({ appMode });
	writeStackConnection(ACTIVE_STACK_FILE, ownedStack.connection);

	return async () => {
		removeStackConnection(ACTIVE_STACK_FILE);
		await stopLocalStack(ownedStack);
	};
}