import { createSelector } from 'reselect';
import { State } from 'types/State';
import {
  articleFragmentsFromRootStateSelector,
  createDemornalisedArticleFragment,
  ArticleFragmentTree
} from 'shared/selectors/shared';

type ClipboardTree = {
  articleFragments: ArticleFragmentTree[];
};

const clipboardContentSelector = (state: State) => state.clipboard || [];

const clipboardArticlesSelector = createSelector(
  clipboardContentSelector,
  articleFragmentsFromRootStateSelector,
  (clipboard, articleFragments) => clipboard.map(afId => articleFragments[afId])
);

const clipboardAsTreeSelector = createSelector(
  [clipboardContentSelector, articleFragmentsFromRootStateSelector],
  (clipboardContent, articleFragments): ClipboardTree => ({
    articleFragments: clipboardContent.map(fragmentId =>
      createDemornalisedArticleFragment(fragmentId, articleFragments)
    )
  })
);

export {
  clipboardArticlesSelector,
  clipboardAsTreeSelector,
  clipboardContentSelector,
  ClipboardTree
};
