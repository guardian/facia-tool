import {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { clipboardSelector } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { normalize, denormalize } from './clipboardSchema';

function normaliseClipboard(clipboard: {
  articles: NestedArticleFragment[]
}): {
  clipboard: { articles: string[] },
  articleFragments: { [id: string]: ArticleFragment }
} {
  const normalisedClipboard = normalize(clipboard);
  return {
    clipboard: normalisedClipboard.result,
    articleFragments: normalisedClipboard.entities.articleFragments || {}
  };
}

function denormaliseClipboard(
  state: State
): { articles: NestedArticleFragment[] } {
  const clipboard = clipboardSelector(state);

  return denormalize(
    { articles: clipboard },
    { articleFragments: state.shared.articleFragments }
  );
}

export { normaliseClipboard, denormaliseClipboard };
