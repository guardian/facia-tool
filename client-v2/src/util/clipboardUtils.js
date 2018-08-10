// @flow

import {
  removeClipboardArticleFragment,
  addClipboardArticleFragment
} from 'actions/Clipboard';
import {
  removeSupportingArticleFragmentFromClipboard,
  addSupportingArticleFragmentToClipboard
} from 'actions/ArticleFragments';
import { type Action } from 'types/Action';
import { type Move, type Insert } from 'guration';
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

const toExternalMap: {
  [string]: { [string]: (move: Insert) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, path } }): Action =>
      addSupportingArticleFragmentToClipboard(path.parent.id, id, path.index),
    clipboard: ({ payload: { id, path } }): Action =>
      addClipboardArticleFragment(id, path.index)
  }
};

const mapMoveEditToActions = (edit: Move) => [
  ((fromMap[edit.payload.type] || {})[edit.payload.from.parent.type] ||
    (() => null))(edit),
  ((toMap[edit.payload.type] || {})[edit.payload.to.parent.type] ||
    (() => null))(edit)
];

const mapMoveInsertToActions = (insert: Insert) => [
  ((toExternalMap[insert.payload.type] || {})[
    insert.payload.path.parent.type
  ] || (() => null))(insert)
];

export {
  mapMoveEditToActions,
  mapMoveInsertToActions,
  normaliseClipboard,
  denormaliseClipboard
};
