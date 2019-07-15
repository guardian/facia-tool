import { State } from 'types/State';
import { selectArticleFragmentsFromRootState } from 'shared/selectors/shared';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';

const selectClipboardContent = (state: State) => state.clipboard || [];

const selectClipboardArticles = createShallowEqualResultSelector(
  selectClipboardContent,
  selectArticleFragmentsFromRootState,
  (clipboard, articleFragments) => clipboard.map(afId => articleFragments[afId])
);

export { selectClipboardArticles, selectClipboardContent };
