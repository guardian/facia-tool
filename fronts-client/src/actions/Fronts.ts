import { Dispatch, ThunkResult } from 'types/Store';
import type { Action } from 'types/Action';
import type { State } from 'types/State';
import { fetchLastPressed as fetchLastPressedApi } from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { VisibleArticlesResponse } from 'types/FaciaApi';
import { Stages } from 'types/Collection';
import { fetchFrontsConfigStrategy } from 'strategies/fetch-fronts-config';

function fetchLastPressedSuccess(frontId: string, datePressed: string): Action {
	return {
		type: 'FETCH_LAST_PRESSED_SUCCESS',
		payload: {
			receivedAt: Date.now(),
			frontId,
			datePressed,
		},
	};
}

function recordStaleFronts(frontId: string, frontIsStale: boolean): Action {
	return {
		type: 'RECORD_STALE_FRONTS',
		payload: {
			[frontId]: frontIsStale,
		},
	};
}

function recordVisibleArticles(
	collectionId: string,
	visibleArticlesResponse: VisibleArticlesResponse,
	stage: Stages,
): Action {
	return {
		type: 'FETCH_VISIBLE_ARTICLES_SUCCESS',
		payload: {
			collectionId,
			visibleArticlesResponse,
			stage,
		},
	};
}

function fetchLastPressed(frontId: string): ThunkResult<void> {
	return (dispatch: Dispatch) =>
		fetchLastPressedApi(frontId)
			.then((datePressed) =>
				dispatch(fetchLastPressedSuccess(frontId, datePressed)),
			)
			.catch(() => {
				// @todo: implement once error handling is done
			});
}

export {
	fetchLastPressed,
	fetchLastPressedSuccess,
	recordVisibleArticles,
	recordStaleFronts,
};

export default function getFrontsConfig(): ThunkResult<
	Promise<
		| ReturnType<typeof frontsConfigActions.fetchSuccess>
		| ReturnType<typeof frontsConfigActions.fetchError>
	>
> {
	return (dispatch: Dispatch, getState: () => State) => {
		dispatch(frontsConfigActions.fetchStart());
		const promise = fetchFrontsConfigStrategy(getState());
		if (!promise) {
			return Promise.resolve(
				dispatch(
					frontsConfigActions.fetchError('cannot fetch config for this route'),
				),
			);
		}
		return promise
			.then((res) => {
				return dispatch(frontsConfigActions.fetchSuccess(res));
			})
			.catch((error: string) =>
				dispatch(frontsConfigActions.fetchError(error)),
			);
	};
}
