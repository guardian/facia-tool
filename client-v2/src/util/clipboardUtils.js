// @flow

import type {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { clipboardSelector } from 'selectors/frontsSelectors';
import { type State } from 'types/State';
import { type Action } from 'types/Action';
import { type Move, type Insert } from '@guardian/guration';
import {
  removeClipboardArticleFragment,
  addClipboardArticleFragment
} from 'actions/Clipboard';
import {
  removeSupportingArticleFragmentFromClipboard,
  addSupportingArticleFragmentToClipboard
} from 'actions/ArticleFragments';
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

const getMoveActions = ({
  payload: { id, from, to }
}: Move): Array<null | Action> => {
  const getFromAction = () => {
    if (from.parent.type === 'articleFragment') {
      return removeSupportingArticleFragmentFromClipboard(from.parent.id, id);
    }

    if (from.parent.type === 'clipboard') {
      return removeClipboardArticleFragment(id);
    }
    return null;
  };

  const getToAction = () => {
    if (to.parent.type === 'articleFragment') {
      return addSupportingArticleFragmentToClipboard(
        to.parent.id,
        id,
        to.index
      );
    }
    if (to.parent.type === 'clipboard') {
      return addClipboardArticleFragment(id, to.index);
    }
    return null;
  };

  return [getFromAction(), getToAction()];
};

const getInsertActions = ({
  payload: { id, path }
}: Insert): Array<null | Action> => {
  if (path.parent.type === 'articleFragment') {
    return [
      addSupportingArticleFragmentToClipboard(path.parent.id, id, path.index)
    ];
  }

  if (path.parent.type === 'clipboard') {
    return [addClipboardArticleFragment(id, path.index)];
  }
  return [null];
};

export {
  normaliseClipboard,
  denormaliseClipboard,
  getMoveActions,
  getInsertActions
};
