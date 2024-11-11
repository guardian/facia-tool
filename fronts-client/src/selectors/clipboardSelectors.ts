import type { State } from 'types/State';
import { selectCardsFromRootState } from 'selectors/shared';
import { createShallowEqualResultSelector } from 'util/selectorUtils';

const selectClipboardContent = (state: State) => state.clipboard || [];

const selectClipboardArticles = createShallowEqualResultSelector(
	selectClipboardContent,
	selectCardsFromRootState,
	(clipboard, cards) => clipboard.map((afId: string) => cards[afId]),
);

export { selectClipboardArticles, selectClipboardContent };
