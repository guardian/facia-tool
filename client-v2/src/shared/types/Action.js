// @flow

import type { ExternalArticle } from './ExternalArticle';
import type { Collection, ArticleFragment } from './Collection';
import type { Actions } from '../util/createAsyncResourceBundle';

type ArticleFragmentsReceived = {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
  payload: { [string]: ArticleFragment }
};
type RemoveSupportingArticleFragment = {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string
  }
};
type AddSupportingArticleFragment = {
  type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string,
    index: number
  }
};
type RemoveCollectionArticleFragment = {
  type: 'SHARED/REMOVE_COLLECTION_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    browsingStage: string
  }
};
type AddColletionArticleFragment = {
  type: 'SHARED/ADD_COLLECTION_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    index: number,
    browsingStage: string
  }
};

type ChangeArticleGroup = {
  type: 'SHARED/CHANGE_ARTICLE_GROUP',
  payload: {
    id: string,
    group: string
  }
};

type Action =
<<<<<<< HEAD
  | CollectionReceivedAction
  | ExternalArticlesReceived
  | RequestCollectionArticles
  | ArticleFragmentsReceived
  | RemoveSupportingArticleFragment
  | AddSupportingArticleFragment
  | RemoveCollectionArticleFragment
  | AddColletionArticleFragment
  | ChangeArticleGroup;
=======
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived;
>>>>>>> Updated action typing

export type { Action };
