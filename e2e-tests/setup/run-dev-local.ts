import { startLocalStack, stopLocalStack } from "./stackContainers.js";
import {
	SHARED_STACK_FILE,
	removeStackConnection,
	writeStackConnection,
} from "./sharedStack.js";

const stack = await startLocalStack({ appMode: "native" });
writeStackConnection(SHARED_STACK_FILE, stack.connection);
console.log(`Local e2e stack ready at ${stack.connection.baseUrl}`);

let stopping = false;
async function stop(): Promise<void> {
	if (stopping) {
		return;
	}
	stopping = true;
	removeStackConnection(SHARED_STACK_FILE);
	await stopLocalStack(stack);
}

process.once("SIGINT", () => void stop().then(() => process.exit(0)));
process.once("SIGTERM", () => void stop().then(() => process.exit(0)));

await new Promise(() => undefined);