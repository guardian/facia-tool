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
interface RemoveSupportingArticleFragment {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT';
  payload: {
    id: string;
    supportingArticleFragmentId: string;
  };
}

interface InsertArticleFragment {
  type: 'SHARED/INSERT_ARTICLE_FRAGMENT';
  payload: {
    to: {
      id: string;
      type: string;
      index: number;
    };
    id: string;
    from: null | {
      id: string;
      type: string;
    };
    articleFragmentMap: { [uuid: string]: ArticleFragment };
  };
}
interface RemoveGroupArticleFragment {
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT';
  payload: {
    id: string;
    articleFragmentId: string;
  };
}

type Action =
  | RemoveSupportingArticleFragment
  | GroupsReceived
  | InsertArticleFragment
  | RemoveGroupArticleFragment
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | UpdateArticleFragmentMeta;

export {
  Action,
  RemoveSupportingArticleFragment,
  InsertArticleFragment,
  RemoveGroupArticleFragment,
  ArticleFragmentsReceived,
  UpdateArticleFragmentMeta
};
