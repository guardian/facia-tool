import articleFragments from './articleFragmentsReducer';
import groups from './groupsReducer';
import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';
import { reducer as featureSwitches } from '../redux/modules/featureSwitches';
import { reducer as pageViewData } from '../../redux/modules/pageViewData';
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
  featureSwitches: ReturnType<typeof featureSwitches>;
  pageViewData: ReturnType<typeof pageViewData>;
}

const rootReducer = (state: any = {}, action: any): State => ({
  articleFragments: articleFragments(state.articleFragments, action, state),
  groups: groups(state.groups, action, state),
  collections: collections(state.collections, action),
  externalArticles: externalArticles(state.externalArticles, action),
  featureSwitches: featureSwitches(state.featureSwitches, action),
  pageViewData: pageViewData(state.pageViewData, action)
});

export { State };

export default rootReducer;
