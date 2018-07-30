// @flow

import { getURLCAPIID } from 'util/CAPIUtils';
import {
  removeCollectionArticleFragment,
  addCollectionArticleFragment
} from 'actions/Collections';
import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment
} from 'actions/ArticleFragments';
import { type Action } from 'types/Action';
import { type Move } from '@guardian/guration';

const fromMap: {
  [string]: { [string]: (move: Move, browsingState: string) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, from } }) =>
      removeSupportingArticleFragment(from.parent.id, id),
    collection: ({ payload: { id, from } }, browsingStage) =>
      removeCollectionArticleFragment(from.parent.id, id, browsingStage)
  }
};

const toMap: {
  [string]: { [string]: (move: Move, browsingState: string) => Action }
} = {
  articleFragment: {
    articleFragment: ({ payload: { id, to } }) =>
      addSupportingArticleFragment(to.parent.id, id, to.index),
    collection: ({ payload: { id, to } }, browsingStage) =>
      addCollectionArticleFragment(to.parent.id, id, to.index, browsingStage)
  }
};

const mapMoveEditToActions = (edit: Move, browsingState: string) => [
  ((fromMap[edit.payload.type] || {})[edit.payload.from.parent.type] ||
    (() => null))(edit, browsingState),
  ((toMap[edit.payload.type] || {})[edit.payload.to.parent.type] ||
    (() => null))(edit, browsingState)
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
