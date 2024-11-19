import createAsyncResourceBundle, {
	IPagination,
} from '../lib/createAsyncResourceBundle';
import { ThunkResult } from '../types/Store';
import { FeastKeywordType } from '../types/FeastKeyword';
import { liveRecipes } from '../services/recipeQuery';
import { createSelector } from 'reselect';
import { State } from '../types/State';

const bundle = createAsyncResourceBundle('feastKeywords', {
	indexById: true,
	selectLocalState: (state) => state.feastKeywords,
});

export const fetchKeywords =
	(forType: FeastKeywordType): ThunkResult<void> =>
	async (dispatch) => {
		dispatch(actions.fetchStart(forType));

		try {
			const kwdata = await liveRecipes.keywords(forType);

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

const selectAllKeywords = (state: State) => state.feastKeywords.data;
const makeKeywordSelector = (kwType: FeastKeywordType) =>
	createSelector([selectAllKeywords], (kws) => {
		return Object.keys(kws).filter((_) => kws[_].keywordType === kwType);
	});
const selectCelebrationKeywords = makeKeywordSelector('celebration');
const selectDietKeywords = makeKeywordSelector('diet');

export const actionNames = bundle.actionNames;
export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
	...bundle.selectors,
	selectCelebrationKeywords,
	selectDietKeywords,
};
