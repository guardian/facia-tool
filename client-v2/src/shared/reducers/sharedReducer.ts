import articleFragments from './articleFragmentsReducer';
import groups from './groupsReducer';
import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';
import { ArticleFragment, Group } from 'shared/types/Collection';

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
