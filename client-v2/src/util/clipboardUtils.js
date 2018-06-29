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

const fromMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, from } }) =>
      removeSupportingArticleFragmentFromClipboard(from.parent.id, id),
    clipboard: ({ payload: { id } }) => removeClipboardArticleFragment(id)
  }
};

const toMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, to } }) =>
      addSupportingArticleFragmentToClipboard(to.parent.id, id, to.index),
    clipboard: ({ payload: { id, to } }) =>
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

export { urlToArticle, mapMoveEditToActions };
