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

interface InsertArticleFragment {
  type: 'SHARED/INSERT_ARTICLE_FRAGMENT';
  payload: {
    to: {
      id: string;
      type: string;
      index: number;
    };
    id: string;
    articleFragmentMap: { [uuid: string]: ArticleFragment };
  };
}
interface RemoveArticleFragment {
  type: 'SHARED/REMOVE_ARTICLE_FRAGMENT';
  payload: {
    parentType: string;
    id: string;
    articleFragmentId: string;
  };
}

type Action =
  | GroupsReceived
  | InsertArticleFragment
  | RemoveArticleFragment
  | Actions<ExternalArticle>
  | Actions<Collection>
  | ArticleFragmentsReceived
  | UpdateArticleFragmentMeta;

export {
  Action,
  InsertArticleFragment,
  RemoveArticleFragment,
  ArticleFragmentsReceived,
  UpdateArticleFragmentMeta
};
