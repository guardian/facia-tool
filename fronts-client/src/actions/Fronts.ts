import { Dispatch, ThunkResult } from 'types/Store';
import type { Action } from 'types/Action';
import type { State } from 'types/State';
import {
	fetchLastPressed as fetchLastPressedApi,
	updateFrontConfig as updateFrontConfigApi,
	createFront as createFrontApi,
} from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { FrontConfigResponse, VisibleArticlesResponse } from 'types/FaciaApi';
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
	visibleArticles: VisibleArticlesResponse,
	stage: Stages,
): Action {
	return {
		type: 'FETCH_VISIBLE_ARTICLES_SUCCESS',
		payload: {
			collectionId,
			visibleArticles,
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

export function saveFrontConfig(
	updatedFront: FrontConfigResponse & { id: string },
): ThunkResult<Promise<void>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		const { id, ...rest } = updatedFront;
		await updateFrontConfigApi(id, rest);
		await dispatch(getFrontsConfig());
	};
}

export function createFront(
	frontId: string,
	priority: string | undefined,
): ThunkResult<Promise<void>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		const createFrontRequest = {
			id: frontId,
			isHidden: true,
			initialCollection: {
				displayName: 'New Collection',
				type: 'flexible/general',
			},
			priority,
		};
		await createFrontApi(createFrontRequest);
		await dispatch(getFrontsConfig());
	};
}

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
