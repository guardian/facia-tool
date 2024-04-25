import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { Recipe } from 'types/Recipe';

type RecipesState = Recipe[];

export const { actions, reducer, selectors } =
  createAsyncResourceBundle<RecipesState>('recipes', {
    indexById: true,
    // Add stub data in the absence of proper search data.
    initialData: [
      {
        id: 'example-recipe',
        featuredImage: {
          url: 'https://media.guim.co.uk/7f96c515c4e320b8ded848f23ffdef8bd311fcad/245_1381_2750_2751/2000.jpg',
          mediaId: '7f96c515c4e320b8ded848f23ffdef8bd311fcad',
          cropId: '',
          source: 'The Guardian. Food stylist: Loic Parisot.',
          photographer: 'Robert Billington',
          caption:
            'Felicity Cloake’s Thai green curry works with chicken, seafood, pork, beef or tofu.',
          mediaApiUri: '',
          width: 2000,
          height: 2000,
        },
      },
    ],
  });
