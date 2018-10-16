import { ExternalArticle } from './ExternalArticle';
import {
  Collection,
  ArticleFragment,
  Group,
  ArticleFragmentMeta
} from './Collection';
import { Actions } from '../util/createAsyncResourceBundle';

interface ArticleFragmentsReceived {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
  payload: { [id: string]: ArticleFragment }
}
interface GroupsReceived {
  type: 'SHARED/GROUPS_RECEIVED',
  payload: { [id: string]: Group }
}
interface UpdateArticleFragmentMeta {
  type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META',
  payload: { id: string, meta: ArticleFragmentMeta }
}
interface RemoveSupportingArticleFragment {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string
  }
}
interface AddSupportingArticleFragment {
  type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    supportingArticleFragmentId: string,
    index: number
  }
}
interface ReplaceArticleFragmentSupporting {
  type: 'SHARED/REPLACE_ARTICLE_FRAGMENT_SUPPORTING',
  payload: {
    id: string,
    supporting: string[]
  }
}
interface RemoveGroupArticleFragment {
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string
  }
}
interface AddGroupArticleFragment {
  type: 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id: string,
    articleFragmentId: string,
    index: number
  }
}
interface ReplaceGroupArticleFragments {
  type: 'SHARED/REPLACE_GROUP_ARTICLE_FRAGMENTS',
  payload: {
    id: string,
    articleFragments: string[]
  }
}

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

export {
  Action,
  RemoveSupportingArticleFragment,
  AddSupportingArticleFragment,
  RemoveGroupArticleFragment,
  AddGroupArticleFragment,
  ArticleFragmentsReceived,
  UpdateArticleFragmentMeta,
  ReplaceGroupArticleFragments,
  ReplaceArticleFragmentSupporting
};
