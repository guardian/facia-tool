import { combineReducers } from 'redux';
import articleFragments from './articleFragmentsReducer';
import groups from './groupsReducer';
import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';
import { ArticleFragment, Group, Collection } from 'shared/types/Collection';
import { ExternalArticle } from 'shared/types/ExternalArticle';

interface State {
  articleFragments: {
    [uuid: string]: ArticleFragment;
  };
  groups: {
    [id: string]: Group;
  };
  collections: ReturnType<typeof collections>;
  externalArticles: ReturnType<typeof externalArticles>;
}

const rootReducer = (state: any = {}, action: any): State => ({
  articleFragments: articleFragments(state.articleFragments, action, state),
  groups: groups(state.groups, action, state),
  collections: collections(state.collections, action),
  externalArticles: externalArticles(state.externalArticles, action)
});

export { State };

export default rootReducer;
