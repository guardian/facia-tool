// @flow

import type { ExternalArticle } from './ExternalArticle';
import type { Collection, ArticleFragment, Group } from './Collection';
import type { Actions } from '../util/createAsyncResourceBundle';

type ArticleFragmentsReceived = {|
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
  payload: { [string]: ArticleFragment }
|};
type GroupsReceived = {|
  type: 'SHARED/GROUPS_RECEIVED',
  payload: { [string]: Group }
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
type RemoveGroupArticleFragment = {|
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string
  }
|};
type AddGroupArticleFragment = {|
  type: 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    index: number
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
  | GroupsReceived
  | AddSupportingArticleFragment
  | RemoveGroupArticleFragment
  | AddGroupArticleFragment
  | ChangeArticleGroup
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived;

export type {
  Action,
  RemoveSupportingArticleFragment,
  AddSupportingArticleFragment,
  RemoveGroupArticleFragment,
  AddGroupArticleFragment,
  ChangeArticleGroup,
  ArticleFragmentsReceived
};
