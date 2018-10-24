import { createSelector } from 'reselect';
import { State } from 'types/State';
import { articleFragmentsFromRootStateSelector } from 'shared/selectors/shared';

const clipboardContentSelector = (state: State) => state.clipboard || [];

const clipboardArticlesSelector = createSelector(
  clipboardContentSelector,
  articleFragmentsFromRootStateSelector,
  (clipboard, articleFragments) => clipboard.map(afId => articleFragments[afId])
);

export { clipboardArticlesSelector, clipboardContentSelector };
