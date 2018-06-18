// @flow

function removeCollectionArticleFragment(
  id: string,
  articleFragmentId: string,
  browsingStage: string
) {
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
) {
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

export { removeCollectionArticleFragment, addCollectionArticleFragment };
