import { ExternalArticle } from './ExternalArticle';
import {
  Collection,
  ArticleFragment,
  Group,
  ArticleFragmentMeta
} from './Collection';
import { Actions } from 'lib/createAsyncResourceBundle';
import { copyArticleFragmentImageMeta } from 'shared/actions/ArticleFragments';

interface ArticleFragmentsReceived {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED';
  payload: { [id: string]: ArticleFragment };
}
interface ClearArticleFragments {
  type: 'SHARED/CLEAR_ARTICLE_FRAGMENTS';
  payload: { ids: string[] };
}
interface GroupsReceived {
  type: 'SHARED/GROUPS_RECEIVED';
  payload: { [id: string]: Group };
}
interface UpdateArticleFragmentMeta {
  type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META';
  payload: {
    id: string;
    meta: ArticleFragmentMeta;
    merge: boolean;
  };
}

// The clipboard type here is only needed for when we are inserting
//  into a clipboard. Ideally clipboard type would only belong to the
//  clipboard insert action because a lot of the code to handle insertions
//  in different places in shared is cleaner to have clipboard type here
//  as optional
interface InsertArticleFragmentPayload {
  id: string;
  index: number;
  articleFragmentId: string;
  clipboardType?: string;
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
    clipboardType?: string;
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

interface MaybeAddFrontPublicationDate {
  type: 'SHARED/MAYBE_ADD_FRONT_PUBLICATION';
  payload: {
    id: string;
    date: number;
  };
}

type CopyArticleFragmentImageMeta = ReturnType<
  typeof copyArticleFragmentImageMeta
>;

type Action =
  | GroupsReceived
  | InsertGroupArticleFragment
  | InsertSupportingArticleFragment
  | RemoveGroupArticleFragment
  | RemoveSupportingArticleFragment
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | ClearArticleFragments
  | UpdateArticleFragmentMeta
  | MaybeAddFrontPublicationDate
  | CapGroupSiblings
  | CopyArticleFragmentImageMeta;

export {
  Action,
  InsertGroupArticleFragment,
  InsertSupportingArticleFragment,
  RemoveGroupArticleFragment,
  RemoveSupportingArticleFragment,
  ArticleFragmentsReceived,
  ClearArticleFragments,
  UpdateArticleFragmentMeta,
  InsertArticleFragmentPayload,
  RemoveArticleFragmentPayload,
  CapGroupSiblings,
  MaybeAddFrontPublicationDate
};
