// @flow

import type { Action } from 'types/Action';

import type { Collection } from 'shared/types/Collection';

function collectionReceived(collection: Collection): Action {
  return {
    type: 'SHARED/COLLECTION_RECEIVED',
    payload: collection
  };
}

function removeCollectionArticleFragment(
  id: string,
  articleFragmentId: string,
  browsingStage: string
): Action {
  return {
    type: 'SHARED/REMOVE_COLLECTION_ARTICLE_FRAGMENT',
    payload: {
      id,
      articleFragmentId,
      browsingStage
    }
  };
}

function addCollectionArticleFragment(
  id: string,
  articleFragmentId: string,
  index: number,
  browsingStage: string
): Action {
  return {
    type: 'SHARED/ADD_COLLECTION_ARTICLE_FRAGMENT',
    payload: {
      id,
      articleFragmentId,
      index,
      browsingStage
    }
  };
}

export {
  collectionReceived,
  removeCollectionArticleFragment,
  addCollectionArticleFragment
};
