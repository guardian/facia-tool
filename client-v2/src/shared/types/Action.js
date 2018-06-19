// @flow

import type { ExternalArticle } from './ExternalArticle';
import type { Collection, ArticleFragment } from './Collection';
import type { Actions } from '../util/createAsyncResourceBundle';

type ArticleFragmentsReceived = {|
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
  payload: { [string]: ArticleFragment }
|};

type RemoveSupportingArticleFragment = {|
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string
  }
|};
type AddSupportingArticleFragment = {|
  type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string,
    index: number
  }
|};
type RemoveCollectionArticleFragment = {|
  type: 'SHARED/REMOVE_COLLECTION_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    browsingStage: string
  }
|};
type AddCollectionArticleFragment = {|
  type: 'SHARED/ADD_COLLECTION_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    index: number,
    browsingStage: string
  }
|};

type ChangeArticleGroup = {|
  type: 'SHARED/CHANGE_ARTICLE_GROUP',
  payload: {
    id: string,
    group: string
  }
|};

type Action =
  | RemoveSupportingArticleFragment
  | AddSupportingArticleFragment
  | RemoveCollectionArticleFragment
  | AddCollectionArticleFragment
  | ChangeArticleGroup
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived;

export type {
  Action,
  RemoveSupportingArticleFragment,
  AddSupportingArticleFragment,
  RemoveCollectionArticleFragment,
  AddCollectionArticleFragment,
  ChangeArticleGroup,
  ArticleFragmentsReceived
};
