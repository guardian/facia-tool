import { ExternalArticle } from './ExternalArticle';
import {
  Collection,
  ArticleFragment,
  Group,
  ArticleFragmentMeta
} from './Collection';
import { Actions } from 'lib/createAsyncResourceBundle';

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
  id: string;
  index: number;
  articleFragmentId: string;
}

type InsertGroupArticleFragment = {
  type: 'SHARED/INSERT_GROUP_ARTICLE_FRAGMENT';
} & {
  payload: InsertArticleFragmentPayload;
};

type InsertSupportingArticleFragment = {
  type: 'SHARED/INSERT_SUPPORTING_ARTICLE_FRAGMENT';
} & {
  payload: InsertArticleFragmentPayload;
};

interface RemoveArticleFragmentPayload {
  payload: {
    id: string;
    articleFragmentId: string;
  };
}

type RemoveGroupArticleFragment = {
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT';
} & RemoveArticleFragmentPayload;

type RemoveSupportingArticleFragment = {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT';
} & RemoveArticleFragmentPayload;

interface CapGroupSiblings {
  type: 'SHARED/CAP_GROUP_SIBLINGS';
  payload: {
    id: string;
    collectionCap: number;
  };
}

type Action =
  | GroupsReceived
  | InsertGroupArticleFragment
  | InsertSupportingArticleFragment
  | RemoveGroupArticleFragment
  | RemoveSupportingArticleFragment
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | UpdateArticleFragmentMeta
  | CapGroupSiblings;

export {
  Action,
  InsertGroupArticleFragment,
  InsertSupportingArticleFragment,
  RemoveGroupArticleFragment,
  RemoveSupportingArticleFragment,
  ArticleFragmentsReceived,
  UpdateArticleFragmentMeta,
  InsertArticleFragmentPayload,
  RemoveArticleFragmentPayload,
  CapGroupSiblings
};
