import createAsyncResourceBundle, {
	IPagination,
} from '../lib/createAsyncResourceBundle';
import { ThunkResult } from '../types/Store';
import { FeastKeywordType } from '../types/FeastKeyword';
import { liveRecipes } from '../services/recipeQuery';

const bundle = createAsyncResourceBundle('feastKeywords', {
	indexById: false,
	selectLocalState: (state) => state.feastKeywords,
});

export const fetchKeywords =
	(forType: FeastKeywordType): ThunkResult<void> =>
	async (dispatch) => {
		dispatch(actions.fetchStart(forType));

		try {
			const kwdata = await liveRecipes.keywords(forType);
			console.log(kwdata);
			const payload: {
				ignoreOrder?: undefined;
				pagination?: IPagination;
				order?: string[];
			} = {
				pagination: {
					pageSize: kwdata.length,
					totalPages: 1,
					currentPage: 1,
				},
				order: undefined,
			};

			dispatch(
				actions.fetchSuccess(
					kwdata.filter((kw) => !!kw.id),
					payload,
				),
			);
		} catch (err) {
			console.error(`Unable to fetch keywords: `, err);
			dispatch(actions.fetchError(err));
		}
	};

export const actionNames = bundle.actionNames;
export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
	...bundle.selectors,
};
