import createAsyncResourceBundle from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import chefOttolenghi from './fixtures/chef-ottolenghi.json';
import chefStein from './fixtures/chef-stein.json';
import chefCloake from './fixtures/chef-cloake.json';

export const { actions, reducer, selectors } = createAsyncResourceBundle<Chef>(
  'chefs',
  {
    indexById: true,
    initialData: {
      // Add stub data in the absence of proper search data.
      [chefOttolenghi.id]: chefOttolenghi,
      [chefStein.id]: chefStein,
      [chefCloake.id]: chefCloake,
    },
  }
);
