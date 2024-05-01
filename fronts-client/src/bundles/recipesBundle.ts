import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { Recipe } from 'types/Recipe';
import recipe1 from './fixtures/recipe1.json';
import recipe2 from './fixtures/recipe2.json';

export const { actions, reducer, selectors } =
  createAsyncResourceBundle<Recipe>('recipes', {
    indexById: true,
    // Add stub data in the absence of proper search data.
    initialData: {
      [recipe1.id]: recipe1,
      [recipe2.id]: recipe2,
    },
  });
