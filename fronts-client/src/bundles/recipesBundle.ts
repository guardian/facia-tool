import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { Recipe } from 'types/Recipe';
import recipe1 from './fixtures/recipe1.json';
import recipe2 from './fixtures/recipe2.json';
import { liveRecipes, RecipeSearchParams } from '../services/recipeQuery';
import { ThunkResult } from '../types/Store';

export const { actions, reducer, selectors } =
  createAsyncResourceBundle<Recipe>('recipes', {
    indexById: true,
    // Add stub data in the absence of proper search data.
    initialData: {
      [recipe1.id]: recipe1,
      [recipe2.id]: recipe2,
    },
  });


export const fetchRecipes = (
  params: RecipeSearchParams
): ThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.fetchStart());

    try {
      const response = await liveRecipes.recipes(params);
      dispatch(actions.fetchSuccess(response));
    } catch(e) {
      dispatch(actions.fetchError(e));
    }
  }



