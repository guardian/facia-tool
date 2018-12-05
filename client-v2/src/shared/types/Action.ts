import { ExternalArticle } from './ExternalArticle';
import {
  Collection,
  ArticleFragment,
  Group,
  ArticleFragmentMeta
} from './Collection';
import { Actions } from '../util/createAsyncResourceBundle';

interface ArticleFragmentsReceived {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED';
  payload: { [id: string]: ArticleFragment };
}
interface GroupsReceived {
  type: 'SHARED/GROUPS_RECEIVED';
  payload: { [id: string]: Group };
}
interface UpdateArticleFragmentMeta {
  type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META';
  payload: { id: string; meta: ArticleFragmentMeta };
}

interface InsertArticleFragmentPayload {
  payload: {
    id: string;
    index: number;
    articleFragmentId: string;
  };
}

type InsertGroupArticleFragment = {
  type: 'SHARED/INSERT_GROUP_ARTICLE_FRAGMENT';
} & InsertArticleFragmentPayload;

type InsertSupportingArticleFragment = {
  type: 'SHARED/INSERT_SUPPORTING_ARTICLE_FRAGMENT';
} & InsertArticleFragmentPayload;

interface RemoveArticleFragmentPayload {
  payload: {
    id: string;
    articleFragmentId: string;
  }
}

type RemoveGroupArticleFragment = {
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT';
} & RemoveArticleFragmentPayload;

type RemoveSupportingArticleFragment = {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT';
} & RemoveArticleFragmentPayload;

type Action =
  | GroupsReceived
  | InsertGroupArticleFragment
  | InsertSupportingArticleFragment
  | RemoveGroupArticleFragment
  | RemoveSupportingArticleFragment
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | UpdateArticleFragmentMeta;

export {
  Action,
  InsertGroupArticleFragment,
  InsertSupportingArticleFragment,
  RemoveGroupArticleFragment,
  RemoveSupportingArticleFragment,
  ArticleFragmentsReceived,
  UpdateArticleFragmentMeta,
  InsertArticleFragmentPayload,
  RemoveArticleFragmentPayload
};
