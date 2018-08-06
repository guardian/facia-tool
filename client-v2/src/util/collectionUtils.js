// @flow

import { getURLCAPIID } from 'util/CAPIUtils';
import {
  removeGroupArticleFragment,
  addGroupArticleFragment
} from 'actions/Collections';
import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment
} from 'actions/ArticleFragments';
import { type Action } from 'types/Action';
import { type Move } from '@guardian/guration';
import {
  type AddGroupArticleFragment,
  type AddSupportingArticleFragment,
  type RemoveGroupArticleFragment,
  type RemoveSupportingArticleFragment
} from 'shared/types/Action';

const fromMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({
      payload: { id, from }
    }): RemoveSupportingArticleFragment =>
      removeSupportingArticleFragment(from.parent.id, id),
    group: ({ payload: { id, from } }): RemoveGroupArticleFragment =>
      removeGroupArticleFragment(from.parent.id, id)
  }
};

const toMap: {
  [string]: { [string]: (move: Move) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, to } }): AddSupportingArticleFragment =>
      addSupportingArticleFragment(to.parent.id, id, to.index),
    group: ({ payload: { id, to } }): AddGroupArticleFragment =>
      addGroupArticleFragment(to.parent.id, id, to.index)
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
