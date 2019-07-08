import {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { clipboardSelector } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { normalize, denormalize } from './clipboardSchema';
import { notLiveLabels } from 'constants/fronts';

function normaliseClipboard(clipboard: {
  frontsClipboard: NestedArticleFragment[];
  editionsClipboard: NestedArticleFragment[];
}): {
  frontsClipboard: string[];
  editionsClipboard: string[];
  articleFragments: { [id: string]: ArticleFragment };
} {
  const normalisedClipboard = normalize(clipboard);
  return {
    frontsClipboard: normalisedClipboard.result.frontsClipboard,
    editionsClipboard: normalisedClipboard.result.editionsClipboard,
    articleFragments: normalisedClipboard.entities.articleFragments || {}
  };
}

function denormaliseClipboard(
  state: State
): {
  frontsClipboard: NestedArticleFragment[];
  editionsClipboard: NestedArticleFragment[];
} {
  const clipboard = clipboardSelector(state);

  const denormalised = denormalize(clipboard, {
    articleFragments: state.shared.articleFragments
  });
  return denormalised;
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
