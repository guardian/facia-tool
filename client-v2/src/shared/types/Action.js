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
type UpdateArticleFragmentMeta = {|
  type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META',
  payload: { id: string, meta: ArticleFragment.meta }
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
type ReplaceArticleFragmentSupporting = {|
  type: 'SHARED/REPLACE_ARTICLE_FRAGMENT_SUPPORTING',
  payload: {
    id: string,
    supporting: string[]
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
type ReplaceGroupArticleFragments = {|
  type: 'SHARED/REPLACE_GROUP_ARTICLE_FRAGMENTS',
  payload: {
    id: string,
    articleFragments: string[]
  }
|};

type Action =
  | RemoveSupportingArticleFragment
  | GroupsReceived
  | AddSupportingArticleFragment
  | ReplaceArticleFragmentSupporting
  | RemoveGroupArticleFragment
  | AddGroupArticleFragment
  | ReplaceGroupArticleFragments
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | UpdateArticleFragmentMeta;

export type {
  Action,
  RemoveSupportingArticleFragment,
  AddSupportingArticleFragment,
  RemoveGroupArticleFragment,
  AddGroupArticleFragment,
  ArticleFragmentsReceived
};
