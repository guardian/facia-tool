import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { Recipe } from 'types/Recipe';
import recipe1 from './fixtures/recipe1.json';
import recipe2 from './fixtures/recipe2.json';
import { State } from 'types/State';
import { selectCard } from 'selectors/shared';
import { createSelector } from 'reselect';

const bundle = createAsyncResourceBundle<Recipe>('recipes', {
  indexById: true,
  // Add stub data in the absence of proper search data.
  initialData: {
    [recipe1.id]: recipe1,
    [recipe2.id]: recipe2,
  },
});

const selectRecipeDataFromCardId = (
  state: State,
  cardId: string
): Recipe | undefined => {
  const card = selectCard(state, cardId);
  return selectors.selectById(state, card.id);
};

const selectRecipeFromCard = createSelector(
  selectCard,
  selectRecipeDataFromCardId,
  (card, recipe) => {
    if (!card || !recipe) {
      return undefined;
    }

    return {
      ...recipe,
      ...card.meta,
    };
  }
);

export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
  ...bundle.selectors,
  selectRecipeFromCard,
};
