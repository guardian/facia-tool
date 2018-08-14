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

const getMoveActions = ({ payload: { id, from, to } }) => {
  const getFromAction = () => {
    if (from.parent.type === 'articleFragment') {
      return removeSupportingArticleFragment(from.parent.id, id);
    }

    if (from.parent.type === 'group') {
      return removeGroupArticleFragment(from.parent.id, id);
    }
    return () => null;
  };

  const getToAction = () => {
    if (to.parent.type === 'articleFragment') {
      return addSupportingArticleFragment(to.parent.id, id, to.index);
    }
    if (to.parent.type === 'group') {
      return addGroupArticleFragment(to.parent.id, id, to.index);
    }
    return () => null;
  };

  return [getFromAction(), getToAction()];
};

const urlToArticle = (text: string) => {
  const id = getURLCAPIID(text);

  return id
    ? {
        id,
        type: 'articleFragment'
      }
    : 'Can`t covert text to article';
};

export { urlToArticle, getMoveActions };
