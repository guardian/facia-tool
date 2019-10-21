import { State } from 'types/State';
import { selectCardsFromRootState } from 'shared/selectors/shared';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';

const selectClipboardContent = (state: State) => state.clipboard || [];

const selectClipboardArticles = createShallowEqualResultSelector(
  selectClipboardContent,
  selectCardsFromRootState,
  (clipboard, cards) => clipboard.map(afId => cards[afId])
);

export { selectClipboardArticles, selectClipboardContent };
