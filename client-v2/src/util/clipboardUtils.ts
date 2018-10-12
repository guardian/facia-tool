

import type {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { clipboardSelector } from 'selectors/frontsSelectors';
import { type State } from 'types/State';
import { normalize, denormalize } from './clipboardSchema';

function normaliseClipboard(clipboard: {
  articles: Array<NestedArticleFragment>
}): {
  clipboard: { articles: Array<string> },
  articleFragments: { [string]: ArticleFragment }
} {
  const normalisedClipboard = normalize(clipboard);
  return {
    clipboard: normalisedClipboard.result,
    articleFragments: normalisedClipboard.entities.articleFragments || {}
  };
}

function denormaliseClipboard(
  state: State
): { articles: Array<NestedArticleFragment> } {
  const clipboard = clipboardSelector(state);

  return denormalize(
    { articles: clipboard },
    { articleFragments: state.shared.articleFragments }
  );
}

export { normaliseClipboard, denormaliseClipboard };
