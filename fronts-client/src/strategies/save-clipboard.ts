import type { State } from 'types/State';
import {
	saveClipboard,
	saveEditionsClipboard,
	saveFeastClipboard,
} from 'services/faciaApi';
import { runStrategy } from './run-strategy';
import { NestedCard } from 'types/Collection';

const saveClipboardStrategy = (
	state: State,
	content: NestedCard[],
): Promise<void> | null =>
	runStrategy<Promise<void> | null>(state, {
		front: () => saveClipboard(content),
		edition: () => saveEditionsClipboard(content),
		feast: () => saveFeastClipboard(content),
		none: () => null,
	});

export { saveClipboardStrategy };
