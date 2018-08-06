// @flow

import { getURLCAPIID } from 'util/CAPIUtils';
import {
  removeClipboardArticleFragment,
  addClipboardArticleFragment
} from 'actions/Clipboard';
import {
  removeSupportingArticleFragmentFromClipboard,
  addSupportingArticleFragmentToClipboard
} from 'actions/ArticleFragments';
import { type Action } from 'types/Action';
import { type Move } from 'guration';
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

const fromMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, from } }): Action =>
      removeSupportingArticleFragmentFromClipboard(from.parent.id, id),
    clipboard: ({ payload: { id } }): Action =>
      removeClipboardArticleFragment(id)
  }
};

const toMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, to } }): Action =>
      addSupportingArticleFragmentToClipboard(to.parent.id, id, to.index),
    clipboard: ({ payload: { id, to } }): Action =>
      addClipboardArticleFragment(id, to.index)
  }
};

const mapMoveEditToActions = (edit: Move) => [
  ((fromMap[edit.payload.type] || {})[edit.payload.from.parent.type] ||
    (() => null))(edit),
  ((toMap[edit.payload.type] || {})[edit.payload.to.parent.type] ||
    (() => null))(edit)
];

const urlToArticle = (text: string) => {
  const id = getURLCAPIID(text);

  return id
    ? {
        id,
        type: 'articleFragment'
      }
    : 'Can`t covert text to article';
};

export {
  urlToArticle,
  mapMoveEditToActions,
  normaliseClipboard,
  denormaliseClipboard
};
