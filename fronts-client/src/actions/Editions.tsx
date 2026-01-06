import React from 'react';
import keyBy from 'lodash/keyBy';
import {
	proofIssue,
	publishIssue,
	checkIssue,
	putFrontHiddenState,
	putFrontMetadata,
	addCollectionToFront,
	removeCollectionFromFront,
	moveCollection,
} from 'services/editionsApi';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'redux';
import {
	EditionsFrontMetadata,
	FrontConfig,
	FrontsConfig,
} from 'types/FaciaApi';
import noop from 'lodash/noop';
import { startOptionsModal } from './OptionsModal';
import IssueVersions from 'components/Editions/IssueVersions';
import { actions } from 'bundles/frontsConfigBundle';
import { selectors as frontsConfigSelector } from 'bundles/frontsConfigBundle';
import { editionCollectionToCollection } from '../strategies/fetch-collection';
import { getCollectionActions } from './Collections';
import { batchActions } from 'redux-batched-actions';
import { EditionsCollection } from '../types/Edition';
import { State } from '../types/State';
import { selectFront } from '../selectors/shared';

export const check =
	(id: string): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		const errors = await checkIssue(id);
		if (errors.length === 0) {
			alert('No failed checks');
		} else {
			alert(`Check failure 1 of ${errors.length}: ${errors[0]}`);
		}
	};

export const proofEditionIssue =
	(id: string): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		try {
			await proofIssue(id);
			dispatch(
				startOptionsModal(
					'Proof Request Succeeded',
					<>
						<p>
							This issue has been submitted for proofing, please check your app
							using the proof bucket setting, in the next few minutes.
						</p>
						<p>
							If you do not see the issue within 5 minutes please contact a
							member of the support team.
						</p>

						<IssueVersions issueId={id} />
					</>,
					[{ buttonText: 'Dismiss', callback: noop }],
					noop,
					false,
				),
			);
		} catch (error) {
			dispatch(
				startOptionsModal(
					'Proofing Failed',
					<>
						<p>Failed to proof issue!</p>
						<p>If this problem persists, contact the support team.</p>
					</>,
					[],
					noop,
					true,
				),
			);
		}
	};

export const publishEditionIssue =
	(id: string, version?: string): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		if (!version) {
			alert('No proofed issue version found; please use proof button');
		} else {
			try {
				await publishIssue(id, version);
				dispatch(
					startOptionsModal(
						'Publish Request Succeeded',
						<>
							<p>
								This issue has been submitted for publishing, please check your
								app in the next few minutes.
							</p>
							<p>
								If you do not see the issue within 5 minutes please contact a
								member of the support team.
							</p>
							<IssueVersions issueId={id} />
						</>,
						[{ buttonText: 'Dismiss', callback: noop }],
						noop,
						false,
					),
				);
			} catch (error) {
				dispatch(
					startOptionsModal(
						'Published Failed',
						<>
							<p>Failed to publish issue!</p>
							<p>If this problem persists, contact the support team.</p>
						</>,
						[],
						noop,
						true,
					),
				);
			}
		}
	};

export const updateFrontMetadata =
	(id: string, metadata: EditionsFrontMetadata): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		try {
			const nameOverride =
				metadata.nameOverride && metadata.nameOverride.trim();
			const serverMetadata = await putFrontMetadata(id, {
				...metadata,
				nameOverride,
			});

			dispatch({
				type: 'FETCH_UPDATE_METADATA_SUCCESS',
				payload: {
					frontId: id,
					metadata: serverMetadata,
				},
			});
		} catch (error) {
			// @todo implement centralised error handling
		}
	};

export const setFrontHiddenState =
	(id: string, hidden: boolean): ThunkResult<Promise<void>> =>
	async (dispatch: Dispatch) => {
		try {
			const serverHidden = await putFrontHiddenState(id, hidden);
			dispatch({
				type: 'FETCH_FRONT_HIDDEN_STATE_SUCCESS',
				payload: {
					frontId: id,
					hidden: serverHidden,
				},
			});
		} catch (error) {
			// @todo implement centralised error handling
		}
	};

export const addFrontCollection =
	(frontId: string): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		try {
			const collections = await addCollectionToFront(frontId);
			processNewEditionFrontResponse(frontId, collections, dispatch, getState);
		} catch (error) {
			throw error;
		}
	};

export const removeFrontCollection =
	(frontId: string, collectionId: string): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		try {
			const collections = await removeCollectionFromFront(
				frontId,
				collectionId,
			);
			processNewEditionFrontResponse(frontId, collections, dispatch, getState);
		} catch (error) {
			throw error;
		}
	};

export const moveFrontCollection =
	(
		frontId: string,
		collectionId: string,
		direction: 'up' | 'down',
	): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		try {
			const state = getState();
			const front = selectFront(state, { frontId });
			const newIndex = getNewCollectionIndexForMove(
				front,
				collectionId,
				direction,
			);

			if (newIndex === undefined) {
				return;
			}

			const collections = await moveCollection(frontId, collectionId, newIndex);
			processNewEditionFrontResponse(frontId, collections, dispatch, getState);
		} catch (error) {
			throw error;
		}
	};

export const feastCollectionToFrontCollection =
	(
		frontId: string,
		collectionId: string,
		feastCollectionCardId: string,
	): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		const url = `/editions-api/fronts/${frontId}/collections/${collectionId}/feastCollectionToContainer/${feastCollectionCardId}`;
		const response = await fetch(url, {
			method: 'POST',
			credentials: 'include',
		});

		if (response.status === 200) {
			const editionsCollections =
				(await response.json()) as EditionsCollection[];
			processNewEditionFrontResponse(
				frontId,
				editionsCollections,
				dispatch,
				getState,
			);
		} else {
			const responseBody = await response.text();
			console.error(
				`Unable to migrate to container - server said ${response.status} ${responseBody}`,
			);
		}
	};

export const getNewCollectionIndexForMove = (
	front: FrontConfig,
	collectionId: string,
	direction: 'up' | 'down',
): number | undefined => {
	const maybeCollectionIndex = front.collections.findIndex(
		(id) => collectionId === id,
	);

	if (maybeCollectionIndex === -1) {
		console.warn(
			`Could not find collection with id ${maybeCollectionIndex} in front ${front.id}`,
		);
		return undefined;
	}

	const offset = direction === 'up' ? -1 : 1;
	const unclampedIndex = maybeCollectionIndex + offset;
	const maxIndex = front.collections.length - 1;
	const newIndex = Math.max(0, Math.min(unclampedIndex, maxIndex));

	if (newIndex === maybeCollectionIndex) {
		console.warn(
			`Attempt to move collection ${collectionId} out of bounds to index ${newIndex} (min 0, max ${maxIndex})`,
		);

		return undefined;
	}

	return newIndex;
};

const processNewEditionFrontResponse = (
	frontId: string,
	collections: EditionsCollection[],
	dispatch: Dispatch,
	getState: () => State,
) => {
	const state = getState();
	const existingFrontsConfig: FrontsConfig =
		frontsConfigSelector.selectAll(state);

	const newFrontsConfig = {
		fronts: {
			...existingFrontsConfig.fronts,
			[frontId]: {
				...existingFrontsConfig.fronts[frontId],
				collections: collections.map((col) => col.id),
			},
		},
	};

	const mergedFrontsConfig = {
		fronts: {
			...existingFrontsConfig.fronts,
			...newFrontsConfig.fronts,
		},
		collections: {
			...existingFrontsConfig.collections,
			...keyBy(collections, 'id'),
		},
	};

	dispatch(actions.fetchSuccess(mergedFrontsConfig));

	const collectionActions = collections.flatMap((c) =>
		getCollectionActions(editionCollectionToCollection(c), getState),
	);

	dispatch(batchActions(collectionActions));
};
