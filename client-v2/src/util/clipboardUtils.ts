import {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { clipboardSelector } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { normalize, denormalize } from './clipboardSchema';
import { DerivedArticle } from 'shared/types/Article';
import { notLiveLabels } from 'constants/fronts';

function normaliseClipboard(clipboard: {
  articles: NestedArticleFragment[];
}): {
  clipboard: { articles: string[] };
  articleFragments: { [id: string]: ArticleFragment };
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

const getArticleLabel = (
  firstPublicationDate?: string,
  sectionName?: string,
  isLive?: boolean
) => {
  if (isLive) {
    return sectionName;
  }

  if (firstPublicationDate) {
    return notLiveLabels.takenDown;
  }

  return notLiveLabels.draft;
};

export { normaliseClipboard, denormaliseClipboard, getArticleLabel };
