import { batchActions } from 'redux-batched-actions';

import type {
	VisibleArticlesResponse,
	CollectionResponse,
} from 'types/FaciaApi';
import {
	getArticlesBatched,
	discardDraftChangesToCollection as discardDraftChangesToCollectionApi,
	fetchVisibleArticles,
	fetchLastPressed as fetchLastPressedApi,
	publishCollection as publishCollectionApi,
	getCollection as getCollectionApi,
} from 'services/faciaApi';
import { selectUserEmail, selectUserFullName } from 'selectors/configSelectors';
import {
	createSelectGroupArticles,
	createSelectAllCardsInCollections,
	selectCard,
	selectCardMap,
	selectFront,
} from 'selectors/shared';
import {
	actions as externalArticleActions,
	selectIsExternalArticleStale,
} from 'bundles/externalArticlesBundle';
import {
	combineCollectionWithConfig,
	populateDraftArticles,
	getVisibilityArticleDetails,
	getGroupsByStage,
} from 'util/frontsUtils';
import {
	normaliseCollectionWithNestedArticles,
	denormaliseCollection,
} from 'util/shared';
import { cardsReceived, clearCards, updateCard } from 'actions/CardsCommon';
import { groupsReceived } from 'actions/Groups';
import {
	recordVisibleArticles,
	recordStaleFronts,
	fetchLastPressedSuccess,
} from 'actions/Fronts';
import { actions as collectionActions } from 'bundles/collectionsBundle';
import { selectCollectionConfig } from 'selectors/frontsSelectors';
import { Dispatch, ThunkResult } from 'types/Store';
import type { Action } from 'types/Action';
import type { State } from 'types/State';
import { cardSets, noOfOpenCollectionsOnFirstLoad } from 'constants/fronts';
import { isEventGraphicId } from 'constants/eventGraphics';
import { Stages, Collection, CardSets, Card } from 'types/Collection';
import difference from 'lodash/difference';
import { selectCardsInCollections } from 'selectors/collection';
import {
	editorOpenCollections,
	editorCloseCollections,
	editorCloseFormsForCollection,
} from 'bundles/frontsUI';
import flatten from 'lodash/flatten';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import { isFrontStale } from 'util/frontsUtils';
import { selectVisibleArticles } from 'selectors/frontsSelectors';
import { frontStages } from 'constants/fronts';
import { events } from 'services/GA';
import { selectCollectionParams } from 'selectors/collectionSelectors';
import { fetchCollectionsStrategy } from 'strategies/fetch-collection';
import {
	CollectionUpdateMode,
	updateCollectionStrategy,
} from 'strategies/update-collection';
import { getPageViewDataForCollection } from 'actions/PageViewData';
import { isMode } from 'selectors/pathSelectors';
import { groupBy, uniqBy, keyBy } from 'lodash';
import { fetchChefsById } from 'bundles/chefsBundle';
import { fetchRecipesById } from '../bundles/recipesBundle';
import { hasActiveAbTestOnCard } from '../util/abTests';

const selectAllCardsInCollections = createSelectAllCardsInCollections();

function fetchStaleCollections(
	collectionIds: string[],
): ThunkResult<Promise<void>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		const prevState = getState();
		const fetchedCollectionIds = await dispatch(
			getCollections(collectionIds, true),
		);
		const prevArticleIds = selectAllCardsInCollections(
			prevState,
			fetchedCollectionIds,
		);

		dispatch(
			fetchCardReferencedEntitiesForCollections(
				fetchedCollectionIds,
				// get article for *all* collecitonItemSets as it reduces complexity of
				// this code (finding which cardSets we need), and the overlap
				// should be pretty large between all of the sets
				Object.values(cardSets),
			),
		);

		dispatch(clearCards(prevArticleIds));
	};
}

// These are collections which exist in the config but have never had any content
// added to them so they will not have their own collection file. They may be newly
// created collections or fully automated collections.
function getCollectionActionForMissingCollection(
	id: string,
	getState: () => State,
): Action[] {
	const collectionConfig = selectCollectionConfig(getState(), id);
	const collection = combineCollectionWithConfig(collectionConfig, {
		draft: [],
		live: [],
		previously: [],
		id,
		displayName: collectionConfig.displayName,
		targetedRegions: [],
		excludedRegions: [],
	});
	const { normalisedCollection, groups } =
		normaliseCollectionWithNestedArticles(collection, collectionConfig);
	return [
		collectionActions.fetchSuccess(normalisedCollection),
		groupsReceived(groups),
	];
}

export function getCollectionActions(
	collectionResponse: CollectionResponse,
	getState: () => State,
) {
	const state = getState();
	const {
		id,
		collection: collectionWithoutId,
		storiesVisibleByStage,
	} = collectionResponse;
	const collectionConfig = selectCollectionConfig(state, id);
	const collection = {
		...collectionWithoutId,
		id,
	};
	const isEditionsMode = isMode(state, 'editions');
	const collectionWithNestedArticles = combineCollectionWithConfig(
		collectionConfig,
		collection,
		isEditionsMode,
	);
	const hasUnpublishedChanges =
		collectionWithNestedArticles.draft !== undefined;

	const collectionWithDraftArticles = {
		...collectionWithNestedArticles,
		draft: populateDraftArticles(collectionWithNestedArticles),
	};
	const { normalisedCollection, cards, groups } =
		normaliseCollectionWithNestedArticles(
			collectionWithDraftArticles,
			collectionConfig,
		);

	const actions = [
		collectionActions.fetchSuccess(normalisedCollection),
		cardsReceived(cards),
		recordUnpublishedChanges(collection.id, hasUnpublishedChanges),
		groupsReceived(groups),
	];

	if (storiesVisibleByStage.live) {
		actions.push(
			recordVisibleArticles(
				collection.id,
				storiesVisibleByStage.live,
				frontStages.live,
			),
		);
	}
	if (storiesVisibleByStage.draft) {
		actions.push(
			recordVisibleArticles(
				collection.id,
				storiesVisibleByStage.draft,
				frontStages.draft,
			),
		);
	}
	return actions;
}

function getCollections(
	collectionIds: string[],
	returnOnlyUpdatedCollections: boolean = false,
): ThunkResult<Promise<string[]>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		dispatch(collectionActions.fetchStart(collectionIds));
		try {
			const collectionResponses = await fetchCollectionsStrategy(
				getState(),
				collectionIds,
				returnOnlyUpdatedCollections,
			);

			if (!collectionResponses) {
				dispatch(
					collectionActions.fetchError(
						'cannot fetch collections for this route',
					),
				);
				return Promise.resolve([]);
			}

			// TODO: test that this works!
			// find all collections missing in the response and ensure their 'fetch'
			// status is reset
			const missingCollections = difference(
				collectionResponses.map((cr) => cr.id),
				collectionIds,
			);
			const missingActions = missingCollections.map((id) =>
				collectionActions.fetchSuccessIgnore({
					id,
				}),
			);

			let missingCollectionActions: Action[][];
			if (!returnOnlyUpdatedCollections) {
				const missingCollectionIds = collectionIds.filter(
					(id) => !collectionResponses.some((response) => response.id === id),
				);
				missingCollectionActions = missingCollectionIds.map((id) =>
					getCollectionActionForMissingCollection(id, getState),
				);
			} else {
				missingCollectionActions = [];
			}
			const actions = collectionResponses.map((collectionResponse) =>
				getCollectionActions(collectionResponse, getState),
			);

			const actionsToBatch = flatten([
				...actions,
				...missingActions,
				...missingCollectionActions,
			]);

			// this is necessary to ensure lastSuccessfulFetchTimestamp, error etc. are always updated
			// (as we rely on them elsewhere to lock editing if stale/errored)
			const noChangesAction = collectionActions.fetchSuccess([]);

			dispatch(
				actionsToBatch.length > 0
					? batchActions(actionsToBatch)
					: noChangesAction,
			);
			return collectionResponses.map(({ id }) => id);
		} catch (error) {
			dispatch(collectionActions.fetchError(error, collectionIds));
			return [];
		}
	};
}

function updateCollection(
	collection: Collection,
	mode: CollectionUpdateMode,
): ThunkResult<Promise<void>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		const state = getState();
		dispatch(
			batchActions([
				collectionActions.updateStart({
					...collection,
					displayName: collection.displayName && collection.displayName.trim(),
					updatedEmail: selectUserEmail(getState()) || '',
					updatedBy: selectUserFullName(state),
					lastUpdated: Date.now(),
				}),
				recordUnpublishedChanges(collection.id, true),
			]),
		);
		try {
			const denormalisedCollection = denormaliseCollection(
				getState(),
				collection.id,
			);
			await updateCollectionStrategy(
				getState(),
				collection.id,
				denormalisedCollection,
				mode,
			);
			dispatch(collectionActions.updateSuccess(collection.id));
			const visibleArticles = await getVisibleArticles(
				collection,
				getState(),
				frontStages.draft,
			);
			if (visibleArticles) {
				dispatch(
					recordVisibleArticles(
						collection.id,
						visibleArticles,
						frontStages.draft,
					),
				);
			}
		} catch (e) {
			dispatch(collectionActions.updateError(e, collection.id));
			throw e;
		}
	};
}

/**
 * Fetch articles from CAPI and add them to the store.
 */
const fetchArticles =
	(articleIds: string[]): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		// Neither snaps nor event graphics exist in CAPI, so requesting them would
		// only produce spurious "not returned by CAPI" errors.
		const idsToFetch = articleIds.filter(
			(id) => !id.match(/^snap/) && !isEventGraphicId(id),
		);

		if (!idsToFetch.length) {
			return;
		}
		dispatch(externalArticleActions.fetchStart(idsToFetch));
		try {
			const articles = await getArticlesBatched(idsToFetch);
			const freshArticles = articles.filter((article) =>
				selectIsExternalArticleStale(
					getState(),
					article.id,
					article.fields.lastModified,
				),
			);

			if (freshArticles.length) {
				dispatch(externalArticleActions.fetchSuccess(freshArticles));
				console.log('Fetched fresh articles:', freshArticles);
				// Persist the capiHeadline on affected cards.
				// We only look at cards referencing an article whose headline actually
				// changed (freshArticles), skip cards whose stored value is already
				// correct, and dispatch all updates in a single batch to avoid
				// triggering a separate re-render per card.
				const freshArticlesById = keyBy(freshArticles, (_) => _.id);
				const cardMap = selectCardMap(getState());
				const capiHeadlineUpdates = Object.values(cardMap).flatMap((card) => {
					const article = freshArticlesById[card.id];
					if (!article) {
						return [];
					}

					console.log('card.meta', card.meta);
					// const cardHeadline = card.meta.headline || article.fields.headline;
					// const nextCapiHeadline = decideCapiHeadline(
					// 	card.meta.capiHeadline,
					// 	article.fields.headline,
					// 	cardHeadline,
					// );
					const hasActiveAbTest = hasActiveAbTestOnCard(card);
					// if (!nextCapiHeadline ||( (nextCapiHeadline === card.meta.capiHeadline) && !hasActiveAbTest)) {
					// 	return [];
					// }

					/**
					 * If a card has an active ab test, we always want to flag that the underlying headline has changed
					 *
					 * */

					const getHeadlineUpdateState = () => {
						// if there is no capi headline set, its probably a first pass so set it
						if (!card.meta.capiHeadline) {
							console.log('1. no capi headline set', {
								capiHeadline: article.fields.headline,
								showHeadlineUpdate: false,
							});
							return {
								capiHeadline: article.fields.headline,
								showHeadlineUpdate: false,
							};
						}
						const storedCapiheadlineMatchesCardHeadline =
							card.meta.capiHeadline === card.meta.headline;

						const externalHeadlineMatchesCardHeadline =
							article.fields.headline === card.meta.headline;
						const externalHeadlineMatchesStoredCapiHeadline =
							article.fields.headline === card.meta.capiHeadline;

						console.log(card.meta);
						console.log(
							' article.fields.headline::: ',
							article.fields.headline,
						);
						console.log(' card.meta.headline::: ', card.meta.headline);
						console.log('card.meta.capiHeadline::: ', card.meta.capiHeadline);

						if (!hasActiveAbTest) {
							if (card.meta.headline === undefined) {
								console.log('1.5 no card headline set - it will be the same', {
									capiHeadline: article.fields.headline,
									showHeadlineUpdate: false,
								});
								return {
									capiHeadline: article.fields.headline,
									showHeadlineUpdate: false,
								};
							}

							if (
								storedCapiheadlineMatchesCardHeadline &&
								!externalHeadlineMatchesCardHeadline
							) {
								console.log(
									'2. storedCapiheadlineMatchesCardHeadline && !externalHeadlineMatchesCardHeadline',
									{
										capiHeadline: article.fields.headline,
										showHeadlineUpdate: false,
									},
								);
								return {
									capiHeadline: article.fields.headline,
									showHeadlineUpdate: false,
								};
							}
							if (
								!externalHeadlineMatchesCardHeadline &&
								!externalHeadlineMatchesStoredCapiHeadline
							) {
								console.log(
									'3. !externalHeadlineMatchesCardHeadline && !externalHeadlineMatchesStoredCapiHeadline',
									{ showHeadlineUpdate: true },
								);
								return { showHeadlineUpdate: true };
							}
							if (
								externalHeadlineMatchesCardHeadline &&
								!externalHeadlineMatchesStoredCapiHeadline
							) {
								console.log(
									'4. externalHeadlineMatchesCardHeadline && !externalHeadlineMatchesStoredCapiHeadline',
									{
										capiHeadline: article.fields.headline,
										showHeadlineUpdate: false,
									},
								);
								return {
									capiHeadline: article.fields.headline,
									showHeadlineUpdate: false,
								};
							}
							console.log('5. default case', { showHeadlineUpdate: false });
							return { showHeadlineUpdate: false };
						} else {
							if (externalHeadlineMatchesStoredCapiHeadline) {
								console.log('6. externalHeadlineMatchesStoredCapiHeadline', {
									showHeadlineUpdate: false,
								});
								return { showHeadlineUpdate: false };
							}
							console.log('7. default case for active AB test', {
								showHeadlineUpdate: true,
							});
							return { showHeadlineUpdate: true };
						}
					};

					const headlineUpdate = getHeadlineUpdateState();

					return [updateCard(card.uuid, headlineUpdate, { merge: true })];
				});
				if (capiHeadlineUpdates.length) {
					dispatch(batchActions(capiHeadlineUpdates));
				}
			}

			const remainingArticles = difference(
				idsToFetch,
				articles.map((_) => _.id),
			);
			if (remainingArticles.length) {
				dispatch(
					externalArticleActions.fetchError(
						`The following article ids were in a CAPI query but were not returned by CAPI: ${remainingArticles.join(
							', ',
						)}`,
						remainingArticles,
					),
				);
			}
		} catch (e) {
			dispatch(externalArticleActions.fetchError(e, articleIds));
		}
	};

/**
 * Fetch all of the entities referenced by the cards in the given collection ids
 * – articles, recipes etc.
 */
const fetchCardReferencedEntitiesForCollections =
	(
		collectionIds: string[],
		itemSetCandidate: CardSets | CardSets[],
	): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		const state = getState();
		const itemSets = Array.isArray(itemSetCandidate)
			? itemSetCandidate
			: [itemSetCandidate];
		//1.
		const cards = itemSets.reduce(
			(acc, itemSet) => [
				...acc,
				...selectCardsInCollections(state, {
					collectionIds,
					itemSet,
				}),
			],
			[] as Card[],
		);

		// Separate cards by type
		await dispatch(
			fetchCardReferencedEntitiesForCards(cards.map((card) => card.uuid)),
		);
	};

export const fetchCardReferencedEntitiesForCards =
	(cardIds: string[]): ThunkResult<Promise<void>> =>
	async (dispatch, getState) => {
		const state = getState();

		const cards = cardIds.map((id) => selectCard(state, id));
		const dedupedCards = uniqBy(cards, (card) => card.id);
		const cardsByCardType = groupBy(
			dedupedCards,
			(card) => card.cardType ?? 'article',
		);

		const promises = [];

		if (cardsByCardType.article) {
			const articlesPromise = dispatch(
				fetchArticles(cardsByCardType.article.map((card) => card.id)),
			);
			promises.push(articlesPromise);
		}

		if (cardsByCardType.chef) {
			const chefsPromise = dispatch(
				fetchChefsById(cardsByCardType.chef.map((chef) => chef.id)),
			);
			promises.push(chefsPromise);
		}

		if (cardsByCardType.recipe) {
			const recipesPromise = dispatch(
				fetchRecipesById(cardsByCardType.recipe.map((recep) => recep.id)),
			);
			promises.push(recipesPromise);
		}
		await Promise.all(promises);
	};

const getOphanDataForCollections =
	(
		collectionIds: string[],
		frontId: string,
		itemSet: CardSets,
	): ThunkResult<Promise<void[]>> =>
	async (dispatch) => {
		const ophanRequests = collectionIds.map((collectionId) => {
			return dispatch(
				getPageViewDataForCollection(frontId, collectionId, itemSet),
			);
		});
		return Promise.all(ophanRequests);
	};

const openCollectionsAndFetchTheirArticles =
	(
		collectionIds: string[],
		frontId: string,
		itemSet: CardSets,
	): ThunkResult<Promise<void>> =>
	async (dispatch) => {
		dispatch(editorOpenCollections(collectionIds));
		await dispatch(
			fetchCardReferencedEntitiesForCollections(collectionIds, itemSet),
		);
		await dispatch(getOphanDataForCollections(collectionIds, frontId, itemSet));
	};

const closeCollections = (collectionIds: string[]): ThunkResult<void> => {
	return (dispatch) => {
		return dispatch(editorCloseCollections(collectionIds));
	};
};

function getVisibleArticles(
	collection: Collection,
	state: State,
	stage: Stages,
): Promise<VisibleArticlesResponse | undefined> {
	const collectionType = collection.type;
	const groups = getGroupsByStage(collection, stage);
	const selectGroupArticles = createSelectGroupArticles();
	const groupsWithArticles = groups.map((id) =>
		selectGroupArticles(state, { groupId: id }),
	);
	const articleDetails = getVisibilityArticleDetails(groupsWithArticles);

	if (!collectionType) {
		return Promise.resolve(undefined);
	}

	return fetchVisibleArticles(collectionType, articleDetails);
}

/**
 * Initialise the collections in a front --
 * - Fetch all of its collections from the server
 * - Mark as open number of collections indicated by the constant, and fetch their articles
 */
function initialiseCollectionsForFront(
	frontId: string,
	browsingStage: CardSets,
): ThunkResult<Promise<void>> {
	return async (dispatch: Dispatch, getState: () => State) => {
		const front = selectFront(getState(), { frontId });
		if (!front) {
			return;
		}
		const collectionsWithArticlesToLoad = front.collections.slice(
			0,
			noOfOpenCollectionsOnFirstLoad,
		);
		dispatch(editorOpenCollections(collectionsWithArticlesToLoad));
		await dispatch(getCollections(front.collections));
		await dispatch(
			fetchCardReferencedEntitiesForCollections(
				collectionsWithArticlesToLoad,
				browsingStage,
			),
		);
		await dispatch(
			getOphanDataForCollections(
				collectionsWithArticlesToLoad,
				frontId,
				browsingStage,
			),
		);
	};
}

function publishCollection(
	collectionId: string,
	frontId: string,
): ThunkResult<Promise<void>> {
	events.collectionPublished(frontId, collectionId);

	return (dispatch: Dispatch, getState: () => State) => {
		return publishCollectionApi(collectionId)
			.then(() => {
				const batchedActions = [
					recordUnpublishedChanges(collectionId, false),
					editorCloseFormsForCollection(collectionId, frontId),
				];

				const draftVisibleArticles = selectVisibleArticles(getState(), {
					collectionId,
					stage: frontStages.draft,
				});
				// some collections don't have visible articles (the property which shows where articles cut off on mobile/desktop) eg, those with a 'fast' layout
				if (draftVisibleArticles) {
					batchedActions.push(
						recordVisibleArticles(
							collectionId,
							draftVisibleArticles,
							frontStages.live,
						),
					);
				}

				dispatch(batchActions(batchedActions));
				dispatch(getCollections([collectionId]));
				dispatch(pollForCollectionPublished(collectionId, frontId));

				return;
			})
			.catch((e) => {
				console.error('Error during publishing collection:', e);
			});
	};
}

function pollForCollectionPublished(
	collectionId: string,
	frontId: string,
): ThunkResult<Promise<void>> {
	return (dispatch, getState) => {
		return new Promise((resolve) => setTimeout(resolve, 10000))
			.then(() => {
				const [params] = selectCollectionParams(getState(), [collectionId]);
				return Promise.all([
					getCollectionApi(params),
					fetchLastPressedApi(frontId),
				]);
			})
			.then(([collectionResponse, lastPressed]) => {
				const lastPressedInMilliseconds = new Date(lastPressed).getTime();
				dispatch(
					batchActions([
						recordStaleFronts(
							frontId,
							isFrontStale(
								collectionResponse.collection.lastUpdated,
								lastPressedInMilliseconds,
							),
						),
						fetchLastPressedSuccess(frontId, lastPressed),
					]),
				);
			});
	};
}

function discardDraftChangesToCollection(
	collectionId: string,
): ThunkResult<Promise<void>> {
	return (dispatch: Dispatch, getState: () => State) => {
		return discardDraftChangesToCollectionApi(collectionId).then(
			(collectionJson) => {
				dispatch(batchActions(getCollectionActions(collectionJson, getState)));
			},
		);
	};
}

export {
	getCollections,
	fetchCardReferencedEntitiesForCollections,
	openCollectionsAndFetchTheirArticles,
	closeCollections,
	fetchStaleCollections,
	fetchArticles,
	updateCollection,
	initialiseCollectionsForFront,
	publishCollection,
	discardDraftChangesToCollection,
};
