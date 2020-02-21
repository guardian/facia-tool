import cards from './cardsReducer';
import groups from '../../reducers/groupsReducer';
import { reducer as collections } from '../../bundles/collectionsBundle';
import { reducer as externalArticles } from '../../bundles/externalArticlesBundle';
import { reducer as featureSwitches } from 'redux/modules/featureSwitches';
import { reducer as pageViewData } from '../../redux/modules/pageViewData';
import { Card, Group } from 'shared/types/Collection';

interface State {
  cards: {
    [uuid: string]: Card;
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
  cards: cards(state.cards, action),
  groups: groups(state.groups, action, state),
  collections: collections(state.collections, action),
  externalArticles: externalArticles(state.externalArticles, action),
  featureSwitches: featureSwitches(state.featureSwitches, action),
  pageViewData: pageViewData(state.pageViewData, action)
});

export { State };

export default rootReducer;
