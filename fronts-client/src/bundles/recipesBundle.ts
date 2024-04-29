import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { Recipe } from 'types/Recipe';
import recipe1 from './fixtures/recipe1.json';
import recipe2 from './fixtures/recipe2.json';

type RecipesState = Recipe[];

export const { actions, reducer, selectors } =
  createAsyncResourceBundle<RecipesState>('recipes', {
    indexById: true,
    // Add stub data in the absence of proper search data.
    initialData: [recipe1, recipe2],
  });
