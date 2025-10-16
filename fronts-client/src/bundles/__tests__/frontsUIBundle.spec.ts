import set from 'lodash/fp/set';
import {
	default as innerReducer,
	editorOpenFront,
	editorCloseFront,
	editorFavouriteFront,
	editorUnfavouriteFront,
	editorSetFavouriteFronts,
	editorClearOpenFronts,
	editorSetOpenFronts,
	editorOpenCollections,
	editorCloseCollections,
	selectIsCollectionOpen,
	editorCloseOverview,
	selectIsFrontOverviewOpen,
	editorOpenOverview,
	editorCloseClipboard,
	selectIsClipboardOpen,
	editorOpenClipboard,
	editorCloseAllOverviews,
	editorOpenAllOverviews,
	createSelectEditorFrontsByPriority,
	createSelectFrontIdWithOpenAndStarredStatesByPriority,
	editorMoveFront,
	selectEditorFrontIds,
	selectEditorFrontIdsByPriority,
	selectEditorFavouriteFrontIds,
	selectEditorFavouriteFrontIdsByPriority,
	editorSelectCard,
	selectOpenCardForms,
	defaultState,
	editorCloseFormsForCollection,
	createSelectCollectionsInOpenFronts,
	selectOpenFrontsCollectionsAndArticles,
	selectOpenParentFrontOfCard,
	createSelectDoesCollectionHaveOpenForms,
} from '../frontsUI';
import { state as initialState } from 'fixtures/initialState';
import initialStateForOpenFronts from '../../fixtures/initialStateForOpenFronts';
import { frontsConfig } from 'fixtures/frontsConfig';
import type { Action } from 'types/Action';
import type { State as GlobalState } from 'types/State';
import { removeSupportingCard, removeGroupCard } from 'actions/CardsCommon';
import { removeClipboardCard } from 'actions/Clipboard';

type State = ReturnType<typeof innerReducer>;

// this allows us to put _in_ our own slice of state but receive a _global_
// state so that we can test out selectors
const reducer = (state: State | undefined, action: Action): GlobalState =>
	({
		editor: innerReducer(state, action),
	}) as any;

describe('frontsUIBundle', () => {
	describe('selectors', () => {
		describe('selectOpenParentFrontOfCard', () => {
			const state = set(
				['editor', 'collectionIds'],
				['collectionUuid1', 'collectionUuid6'],
				initialStateForOpenFronts,
			);
			it('should select the parent front of an card', () => {
				const result = selectOpenParentFrontOfCard(state, 'card1');
				expect(result).toEqual(['editorialFront', 'collectionUuid1']);
			});
			it("should return undefined if it does't find anything", () => {
				const result = selectOpenParentFrontOfCard(state, 'not-a-thing');
				expect(result).toEqual([]);
			});
			it('should not select from fronts that are not open', () => {
				const stateWithClosedFronts = set(
					['editor', 'frontIdsByPriority', 'editorial'],
					[],
					state,
				);
				const result = selectOpenParentFrontOfCard(
					stateWithClosedFronts,
					'card1',
				);
				expect(result).toEqual([]);
			});
			it('should not select from collections that are not open', () => {
				const stateWithClosedCollections = set(
					['editor', 'collectionIds'],
					[],
					state,
				);
				const result = selectOpenParentFrontOfCard(
					stateWithClosedCollections,
					'card1',
				);
				expect(result).toEqual([]);
			});
		});
		describe('selectEditorFrontIdsByPriority', () => {
			it('should handle empty priorities', () => {
				expect(
					selectEditorFrontIdsByPriority(initialState, 'editorial'),
				).toEqual([]);
			});
			it('should select priorities', () => {
				const stateWithFronts = {
					editor: {
						...initialState.editor,
						frontIdsByPriority: { commercial: ['1', '2'] },
					},
				} as any;
				expect(
					selectEditorFrontIdsByPriority(stateWithFronts, 'commercial'),
				).toEqual(['1', '2']);
			});
		});
		describe('createSelectEditorFrontsByPriority', () => {
			const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
			it('should select nothing if nothing is there', () => {
				expect(selectEditorFrontsByPriority(initialState).length).toEqual(0);
			});
			it('should select editor fronts by priority', () => {
				const stateWithFronts = {
					...initialState,
					fronts: {
						frontsConfig: {
							data: {
								fronts: {
									'1': { id: '1', priority: 'commercial' },
									'2': { id: '2', priority: 'commercial' },
									'3': { id: '3', priority: 'editorial' },
								},
							},
						},
					},
					editor: {
						...initialState.editor,
						frontIdsByPriority: { commercial: ['1', '2'] },
					},
					path: '/v2/commercial',
				} as any;
				expect(selectEditorFrontsByPriority(stateWithFronts)).toEqual([
					{ id: '1', priority: 'commercial' },
					{ id: '2', priority: 'commercial' },
				]);
			});
			it('should memoize editor fronts by priority', () => {
				const state = {
					...initialState,
					path: '/v2/commercial',
				};
				expect(selectEditorFrontsByPriority(state)).toBe(
					selectEditorFrontsByPriority(state),
				);
			});
		});
		describe('selectEditorFavouriteFrontIdsByPriority', () => {
			it('should handle empty priorities', () => {
				expect(
					selectEditorFavouriteFrontIdsByPriority(initialState, 'editorial'),
				).toEqual([]);
			});
			it('should select priorities', () => {
				const stateWithFronts = {
					editor: {
						...initialState.editor,
						favouriteFrontIdsByPriority: { commercial: ['1', '2'] },
					},
				} as any;
				expect(
					selectEditorFavouriteFrontIdsByPriority(
						stateWithFronts,
						'commercial',
					),
				).toEqual(['1', '2']);
			});
		});
		describe('selectEditorFavouriteFrontIdsByPriority', () => {
			it('should handle empty priorities', () => {
				expect(
					selectEditorFavouriteFrontIdsByPriority(initialState, 'editorial'),
				).toEqual([]);
			});
			it('should select priorities', () => {
				const stateWithFronts = {
					editor: {
						...initialState.editor,
						favouriteFrontIdsByPriority: { commercial: ['1', '2'] },
					},
					path: '/v2/commercial',
				} as any;
				expect(
					selectEditorFavouriteFrontIdsByPriority(
						stateWithFronts,
						'commercial',
					),
				).toEqual(['1', '2']);
			});
		});
		describe('createSelectFrontIdWithOpenAndStarredStatesByPriority', () => {
			const stateWithEditorFronts = {
				...initialState,
				editor: {
					...initialState.editor,
					frontIdsByPriority: {
						commercial: ['sc-johnson-partner-zone', 'a-shot-of-sustainability'],
					},
					favouriteFrontIdsByPriority: {
						commercial: [
							'sc-johnson-partner-zone',
							'un-global-compact-partner-zone',
						],
					},
				},
				path: '/v2/commercial',
			} as any;
			const selectFrontIdWithOpenAndStarredStatesByPriority =
				createSelectFrontIdWithOpenAndStarredStatesByPriority();
			it('should select all fronts by priority', () => {
				expect(
					selectFrontIdWithOpenAndStarredStatesByPriority(
						initialState,
						'commercial',
					),
				).toHaveLength(4);
			});

			it('should add correct Open State meta data', () => {
				expect(
					selectFrontIdWithOpenAndStarredStatesByPriority(
						stateWithEditorFronts,
						'commercial',
					),
				).toEqual([
					{
						id: 'a-shot-of-sustainability',
						displayName: undefined,
						index: 1,
						isOpen: true,
						isStarred: false,
					},
					{
						id: 'sc-johnson-partner-zone',
						displayName: undefined,
						index: 0,
						isOpen: true,
						isStarred: true,
					},
					{
						id: 'sustainable-business/fairtrade-partner-zone',
						isOpen: false,
						isStarred: false,
						displayName: undefined,
						index: 2,
					},
					{
						id: 'un-global-compact-partner-zone',
						isOpen: false,
						isStarred: true,
						displayName: undefined,
						index: 3,
					},
				]);
			});
			it('should sort fronts by id and name', () => {
				expect(
					selectFrontIdWithOpenAndStarredStatesByPriority(
						stateWithEditorFronts,
						'commercial',
						'id',
					).map((_) => _.id),
				).toEqual([
					'a-shot-of-sustainability',
					'sc-johnson-partner-zone',
					'sustainable-business/fairtrade-partner-zone',
					'un-global-compact-partner-zone',
				]);
				expect(
					selectFrontIdWithOpenAndStarredStatesByPriority(
						stateWithEditorFronts,
						'commercial',
						'index',
					).map((_) => _.index),
				).toEqual([0, 1, 2, 3]);
			});
		});
		describe('selectOpenFrontsCollectionsAndArticles', () => {
			it('should return just fronts if no collections are open', () => {
				const openEntities = selectOpenFrontsCollectionsAndArticles(
					initialStateForOpenFronts,
				);
				expect(openEntities).toEqual([
					{ collections: [], frontId: 'editorialFront' },
					{ collections: [], frontId: 'editorialFront2' },
				]);
			});
			it('should give an array of fronts, with nested collections and articles, when those fronts and collections are open -- single collection', () => {
				const state = set(
					['editor', 'collectionIds'],
					['collectionUuid1'],
					initialStateForOpenFronts,
				);
				const openEntities = selectOpenFrontsCollectionsAndArticles(state);
				expect(openEntities.length).toEqual(2); // Two fronts
				expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
				expect(openEntities[0].collections[0].articleIds).toEqual([
					'card1',
					'card2',
					'card3',
				]); // First collection has three articles
				expect(openEntities[1].collections.length).toEqual(0); // Second front has no collections
			});
			it('should give an array of fronts, with nested collections and articles, when those fronts and collections are open -- multiple collections', () => {
				const state = set(
					['editor', 'collectionIds'],
					['collectionUuid1', 'collectionUuid6'],
					initialStateForOpenFronts,
				);
				const openEntities = selectOpenFrontsCollectionsAndArticles(state);
				expect(openEntities.length).toEqual(2); // Two fronts
				expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
				expect(openEntities[1].collections.length).toEqual(1); // Second front has one collection
			});
			it('should respect the current browsing stage', () => {
				let state = set(
					['editor', 'collectionIds'],
					['collectionUuid1'],
					initialStateForOpenFronts,
				);
				state = set(
					['editor', 'frontIdsByBrowsingStage', 'editorialFront'],
					'live',
					state,
				);
				const openEntities = selectOpenFrontsCollectionsAndArticles(state);
				expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
				expect(openEntities[0].collections[0].articleIds.length).toEqual(0); // First collection has no live articles
			});
		});
		describe('Selecting collections on all open Fronts', () => {
			const selectCollectionsInOpenFronts =
				createSelectCollectionsInOpenFronts();
			it('return correct collections for one open Front', () => {
				expect(
					selectCollectionsInOpenFronts({
						fronts: {
							frontsConfig,
						},
						editor: {
							frontIdsByPriority: { editorial: ['editorialFront'] },
						},
						path: '/v2/editorial',
					} as any),
				).toEqual(['collectionUuid1']);
			});
			it('return correct collections for multiple open Fronts', () => {
				expect(
					selectCollectionsInOpenFronts({
						fronts: {
							frontsConfig,
						},
						editor: {
							frontIdsByPriority: {
								editorial: ['editorialFront', 'editorialFront2'],
							},
						},
						path: '/v2/editorial',
					} as any),
				).toEqual(['collectionUuid1', 'collectionUuid6']);
			});
			it('return enpty array for no open Fronts', () => {
				expect(
					selectCollectionsInOpenFronts({
						fronts: {
							frontsConfig,
						},
						editor: {
							frontIdsByPriority: {},
						},
						path: '/v2/editorial',
					} as any),
				).toEqual([]);
			});
		});
		describe('selectDoesCollectionHaveOpenForms', () => {
			it('should return false when the collection has no forms open', () => {
				const selectDoesCollectionHaveOpenForms =
					createSelectDoesCollectionHaveOpenForms();
				const state = initialState;
				expect(
					selectDoesCollectionHaveOpenForms(state, {
						frontId: 'exampleFront',
						collectionId: 'collection-id',
					}),
				).toBe(false);
			});
			it('should return true when the collection has a form open', () => {
				const selectDoesCollectionHaveOpenForms =
					createSelectDoesCollectionHaveOpenForms();
				const state = set(
					['editor', 'selectedCards', 'exampleFront'],
					[{ id: 'id', collectionId: 'collection-id', isSupporting: false }],
					initialState,
				);
				expect(
					selectDoesCollectionHaveOpenForms(state, {
						frontId: 'exampleFront',
						collectionId: 'collection-id',
					}),
				).toBe(true);
			});
		});
	});

	describe('reducer', () => {
		it('should move a front within the open editor fronts by ID', () => {
			const state = {
				...initialState.editor,
				frontIdsByPriority: { editorial: ['1', '2', '3'] },
			};
			const newState = reducer(state as any, editorMoveFront('3', 0));
			expect(selectEditorFrontIds(newState)).toEqual({
				editorial: ['3', '1', '2'],
			});
		});
		it('should do nothing when the front is not found', () => {
			const state = {
				...initialState.editor,
				frontIdsByPriority: { editorial: ['1', '2', '3'] },
			};
			const newState = reducer(state as any, editorMoveFront('who?', 0));
			expect(selectEditorFrontIds(newState)).toEqual({
				editorial: ['1', '2', '3'],
			});
		});
		it('should do nothing when the index is out of bounds', () => {
			const state = {
				...initialState.editor,
				frontIdsByPriority: { editorial: ['1', '2', '3'] },
			};
			const newState = reducer(
				state,
				editorMoveFront('sc-johnson-partner-zone', 5),
			);
			expect(selectEditorFrontIds(newState)).toEqual({
				editorial: ['1', '2', '3'],
			});
		});
		it('should add a front to the open editor fronts', () => {
			const state = reducer(
				undefined,
				editorOpenFront('exampleFront', 'editorial') as any,
			);
			expect(selectEditorFrontIds(state)).toEqual({
				editorial: ['exampleFront'],
			});
		});
		it('should remove a front to the open editor fronts', () => {
			const state = reducer(
				{ frontIdsByPriority: { editorial: ['front1', 'front2'] } } as any,
				editorCloseFront('front1'),
			);
			expect(selectEditorFrontIds(state)).toEqual({
				editorial: ['front2'],
			});
		});
		it('should clear fronts to the open editor fronts', () => {
			const state = reducer(
				{ frontIds: ['front1', 'front2'] } as any,
				editorClearOpenFronts(),
			);
			expect(selectEditorFrontIds(state)).toEqual({});
		});

		it('should add a front to the favourite editor fronts', () => {
			const state = reducer(
				undefined,
				editorFavouriteFront('exampleFront', 'editorial') as any,
			);
			expect(selectEditorFavouriteFrontIds(state)).toEqual({
				editorial: ['exampleFront'],
			});
		});

		it('should remove a front to the favourite editor fronts', () => {
			const state = reducer(
				{
					favouriteFrontIdsByPriority: {
						editorial: ['front1', 'front2'],
						training: ['front1', 'front2'],
					},
				} as any,
				editorUnfavouriteFront('front1', 'editorial'),
			);
			expect(selectEditorFavouriteFrontIds(state)).toEqual({
				editorial: ['front2'],
				training: ['front1', 'front2'],
			});
		});
		it('should clear the card selection when selected cards are removed from a front', () => {
			const state = reducer(
				{
					selectedCards: {
						frontId: [{ id: 'cardId', isSupporting: false }],
					},
				} as any,
				removeGroupCard('collectionId', 'cardId'),
			);
			expect(state.editor.selectedCards.frontId).toEqual([]);
		});
		describe('Editor close forms for collection', () => {
			it('should do nothing when there is no form for the front', () => {
				const state = innerReducer(
					defaultState,
					editorCloseFormsForCollection('collectionId', 'frontId'),
				);
				expect(state.selectedCards).toEqual(defaultState.selectedCards);
			});
			it('should clear form data for the given collection id', () => {
				const initial = {
					...defaultState,
					selectedCards: {
						frontId: [
							{
								id: 'articleId1',
								isSupporting: true,
								collectionId: 'collectionId',
							},
							{
								id: 'articleId2',
								isSupporting: true,
								collectionId: 'collectionId2',
							},
							{
								id: 'articleId3',
								isSupporting: true,
								collectionId: 'collectionId',
							},
						],
					},
				};
				const state = innerReducer(
					initial,
					editorCloseFormsForCollection('collectionId', 'frontId'),
				);
				expect(state.selectedCards).toEqual({
					frontId: [
						{
							id: 'articleId2',
							isSupporting: true,
							collectionId: 'collectionId2',
						},
					],
				});
			});
		});
		describe('Clearing article selection in response to persistence events', () => {
			const stateWithSelectedCards = {
				selectedCards: {
					frontId: [{ id: 'cardId', isSupporting: false }],
				},
			} as any;
			it("should not clear the card selection when selected cards aren't in the front", () => {
				const state = reducer(
					stateWithSelectedCards,
					removeGroupCard('collectionId', 'anotherCardId'),
				);
				expect(state.editor).toBe(stateWithSelectedCards);
			});
			it('should clear the card selection when selected supporting cards are removed from a front', () => {
				const state = reducer(
					stateWithSelectedCards,
					removeSupportingCard('collectionId', 'cardId'),
				);
				expect(state.editor.selectedCards.frontId).toEqual([]);
			});
			it("should not clear the card selection when selected supporting cards aren't in the front", () => {
				const state = reducer(
					stateWithSelectedCards,
					removeSupportingCard('collectionId', 'anotherCardId'),
				);
				expect(state.editor).toBe(stateWithSelectedCards);
			});
			it('should clear the card selection when selected clipboard cards are removed from a front', () => {
				const state = reducer(
					stateWithSelectedCards,
					removeClipboardCard('collectionId', 'cardId'),
				);
				expect(state.editor.selectedCards.frontId).toEqual([]);
			});
			it("should not clear the card selection when selected clipboard cards aren't in the front", () => {
				const state = reducer(
					stateWithSelectedCards,
					removeClipboardCard('collectionId', 'anotherCardId'),
				);
				expect(state.editor).toBe(stateWithSelectedCards);
			});
		});
		it('should set the fronts to the open editor fronts', () => {
			const state = reducer(
				{ frontIds: ['front1', 'front2'] } as any,
				editorSetOpenFronts({ editorial: ['front1', 'front3'] }),
			);
			expect(selectEditorFrontIds(state)).toEqual({
				editorial: ['front1', 'front3'],
			});
		});
		it('should set the fave fronts from config to the fave fronts in editor', () => {
			const state = reducer(
				{
					frontIdsByPriority: {
						editorial: ['front1', 'front2'],
					},
				} as any,
				editorSetFavouriteFronts({ editorial: ['front1', 'front3'] }),
			);
			expect(selectEditorFavouriteFrontIds(state)).toEqual({
				editorial: ['front1', 'front3'],
			});
		});
		it('should add a collection to the open editor collections', () => {
			const state = reducer(
				undefined,
				editorOpenCollections('exampleCollection') as any,
			);
			expect(selectIsCollectionOpen(state, 'exampleCollection')).toBe(true);
		});
		it('should add multiple collections to the open editor collections', () => {
			const state = reducer(
				undefined,
				editorOpenCollections([
					'exampleCollection',
					'exampleCollection2',
				]) as any,
			);
			expect(selectIsCollectionOpen(state, 'exampleCollection')).toBe(true);
			expect(selectIsCollectionOpen(state, 'exampleCollection2')).toBe(true);
		});
		it('should remove multiple collections from the open editor collections', () => {
			const state = reducer(
				{ collectionIds: ['collection1', 'collection2'] } as any,
				editorCloseCollections(['collection1', 'collection2']),
			);
			expect(selectIsCollectionOpen(state, 'collection1')).toBe(false);
			expect(selectIsCollectionOpen(state, 'collection1')).toBe(false);
		});
		describe('Front overviews', () => {
			it('should open and close a front overview', () => {
				let state = reducer(
					{ closedOverviews: [] } as any,
					editorCloseOverview('front1'),
				);
				expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(false);
				expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(true);
				state = reducer(state.editor, editorOpenOverview('front1'));
				expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(true);
				expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(true);
			});
		});
		describe('Card form display', () => {
			it('should open a card form', () => {
				const state = reducer(
					undefined,
					editorSelectCard('exampleCard', 'exampleCollection', 'front1'),
				);
				expect(selectOpenCardForms(state, { frontId: 'front1' })).toEqual([
					{
						id: 'exampleCard',
						isSupporting: false,
						collectionId: 'exampleCollection',
					},
				]);
			});
		});
		it('should open and close all editing fronts', () => {
			const state = reducer(
				{ closedOverviews: [], frontIds: ['front1', 'front2'] } as any,
				editorCloseAllOverviews(),
			);
			expect(selectIsFrontOverviewOpen(state, 'front1')).toBe(false);
			expect(selectIsFrontOverviewOpen(state, 'front2')).toBe(false);
			const state2 = reducer(state.editor, editorOpenAllOverviews());
			expect(selectIsFrontOverviewOpen(state2, 'front1')).toBe(true);
			expect(selectIsFrontOverviewOpen(state2, 'front2')).toBe(true);
		});
		it('should open and close the clipboard', () => {
			const state = reducer(
				{ clipboardOpen: true } as any,
				editorCloseClipboard(),
			);
			expect(selectIsClipboardOpen(state)).toBe(false);
			const state2 = reducer(state.editor, editorOpenClipboard());
			expect(selectIsClipboardOpen(state2)).toBe(true);
		});
	});
	describe('Selecting collections on all open Fronts', () => {
		const selectCollectionsInOpenFronts = createSelectCollectionsInOpenFronts();
		it('return correct collections for one open Front', () => {
			expect(
				selectCollectionsInOpenFronts({
					fronts: {
						frontsConfig,
					},
					editor: {
						frontIdsByPriority: { editorial: ['editorialFront'] },
					},
					path: '/v2/editorial',
				} as any),
			).toEqual(['collectionUuid1']);
		});
		it('return correct collections for multiple open Fronts', () => {
			expect(
				selectCollectionsInOpenFronts({
					fronts: {
						frontsConfig,
					},
					editor: {
						frontIdsByPriority: {
							editorial: ['editorialFront', 'editorialFront2'],
						},
					},
					path: '/v2/editorial',
				} as any),
			).toEqual(['collectionUuid1', 'collectionUuid6']);
		});
		it('return enpty array for no open Fronts', () => {
			expect(
				selectCollectionsInOpenFronts({
					fronts: {
						frontsConfig,
					},
					editor: {
						frontIdsByPriority: {},
					},
					path: '/v2/editorial',
				} as any),
			).toEqual([]);
		});
	});
	describe('selectOpenFrontsCollectionsAndArticles', () => {
		it('should return just fronts if no collections are open', () => {
			const openEntities = selectOpenFrontsCollectionsAndArticles(
				initialStateForOpenFronts,
			);
			expect(openEntities).toEqual([
				{ collections: [], frontId: 'editorialFront' },
				{ collections: [], frontId: 'editorialFront2' },
			]);
		});
		it('should give an array of fronts, with nested collections and articles, when those fronts and collections are open -- single collection', () => {
			const state = set(
				['editor', 'collectionIds'],
				['collectionUuid1'],
				initialStateForOpenFronts,
			);
			const openEntities = selectOpenFrontsCollectionsAndArticles(state);
			expect(openEntities.length).toEqual(2); // Two fronts
			expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
			expect(openEntities[0].collections[0].articleIds).toEqual([
				'card1',
				'card2',
				'card3',
			]); // First collection has three articles
			expect(openEntities[1].collections.length).toEqual(0); // Second front has no collections
		});
		it('should give an array of fronts, with nested collections and articles, when those fronts and collections are open -- multiple collections', () => {
			const state = set(
				['editor', 'collectionIds'],
				['collectionUuid1', 'collectionUuid6'],
				initialStateForOpenFronts,
			);
			const openEntities = selectOpenFrontsCollectionsAndArticles(state);
			expect(openEntities.length).toEqual(2); // Two fronts
			expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
			expect(openEntities[1].collections.length).toEqual(1); // Second front has one collection
		});
		it('should respect the current browsing stage', () => {
			let state = set(
				['editor', 'collectionIds'],
				['collectionUuid1'],
				initialStateForOpenFronts,
			);
			state = set(
				['editor', 'frontIdsByBrowsingStage', 'editorialFront'],
				'live',
				state,
			);
			const openEntities = selectOpenFrontsCollectionsAndArticles(state);
			expect(openEntities[0].collections.length).toEqual(1); // First front has one collection
			expect(openEntities[0].collections[0].articleIds.length).toEqual(0); // First collection has no live articles
		});
	});
});
