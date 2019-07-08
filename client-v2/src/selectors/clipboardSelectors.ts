import { State } from 'types/State';
import { articleFragmentsFromRootStateSelector } from 'shared/selectors/shared';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';
import { selectIsEditingEditions } from 'selectors/pathSelectors';

const clipboardContentSelector = (state: State) => state.clipboard || [];

const clipboardArticlesSelector = createShallowEqualResultSelector(
  clipboardContentSelector,
  articleFragmentsFromRootStateSelector,
  selectIsEditingEditions,
  (clipboard, articleFragments, isEditingEditions) => {
    if (isEditingEditions) {
      return clipboard.editionsClipboard.map(afId => articleFragments[afId]);
    }
    return clipboard.frontsClipboard.map(afId => articleFragments[afId]);
  }
);

export { clipboardArticlesSelector, clipboardContentSelector };
