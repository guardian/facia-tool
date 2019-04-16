import { State } from 'types/State';
import { articleFragmentsFromRootStateSelector } from 'shared/selectors/shared';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';

const clipboardContentSelector = (state: State) => state.clipboard || [];

const clipboardArticlesSelector = createShallowEqualResultSelector(
  clipboardContentSelector,
  articleFragmentsFromRootStateSelector,
  (clipboard, articleFragments) => clipboard.map(afId => articleFragments[afId])
);

export { clipboardArticlesSelector, clipboardContentSelector };
