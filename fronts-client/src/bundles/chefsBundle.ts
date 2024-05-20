import createAsyncResourceBundle from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import chefOttolenghi from './fixtures/chef-ottolenghi.json';
import chefStein from './fixtures/chef-stein.json';
import chefCloake from './fixtures/chef-cloake.json';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { createSelector } from 'reselect';
import { stripHtml } from 'util/sanitizeHTML';

const sanitizeChef = (chef: Chef) => ({
  ...chef,
  bio: stripHtml(chef.bio ?? ''),
});

const bundle = createAsyncResourceBundle<Chef>('chefs', {
  indexById: true,
  initialData: {
    // Add stub data in the absence of proper search data.
    [chefOttolenghi.id]: sanitizeChef(chefOttolenghi),
    [chefStein.id]: sanitizeChef(chefStein),
    [chefCloake.id]: sanitizeChef(chefCloake),
  },
});

const selectChefDataFromCardId = (
  state: State,
  cardId: string
): Chef | undefined => {
  const card = selectCard(state, cardId);
  return selectors.selectById(state, card.id);
};

const selectChefFromCard = createSelector(
  selectCard,
  selectChefDataFromCardId,
  (card, chef) => {
    if (!card || !chef) {
      return undefined;
    }

    return {
      ...chef,
      ...card.meta,
    };
  }
);

export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
  ...bundle.selectors,
  selectChefFromCard,
};
