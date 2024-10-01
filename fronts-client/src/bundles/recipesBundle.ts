import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import {
	liveRecipes,
	RecipeSearchHit,
	RecipeSearchParams,
} from '../services/recipeQuery';
import { ThunkResult } from '../types/Store';

export const { actions, reducer, selectors } =
	createAsyncResourceBundle<RecipeSearchHit>('recipes', {
		indexById: true,
		selectLocalState: (state) => state.recipes,
	});

export const fetchRecipes =
	(params: RecipeSearchParams): ThunkResult<void> =>
	async (dispatch) => {
		dispatch(actions.fetchStart());

		try {
			const response = await liveRecipes.recipes(params);
			dispatch(
				actions.fetchSuccess(response.recipes, {
					pagination: {
						pageSize: response.recipes.length,
						currentPage: 1,
						totalPages: 1,
					},
					order: response.recipes.map((_) => _.id),
				}),
			);
		} catch (e) {
			dispatch(actions.fetchError(e));
		}
	};

export const fetchRecipesById =
	(idList: string[]): ThunkResult<void> =>
	async (dispatch) => {
		dispatch(actions.fetchStart());

		try {
			const recipes = await liveRecipes.recipesById(idList);
			dispatch(
				actions.fetchSuccess(recipes, {
					order: recipes.map((_) => _.id),
				}),
			);
		} catch (e) {
			dispatch(actions.fetchError(e));
		}
	};
