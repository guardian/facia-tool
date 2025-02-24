import {
	collection,
	collectionWithPreviously,
	collectionConfig,
	collectionWithoutGroups,
	collectionWithSupportingArticles,
	stateWithCollection,
	stateWithCollectionAndSupporting,
	normalisedCollectonWithPreviously,
} from 'fixtures/shared';
import {
	normaliseCollectionWithNestedArticles,
	denormaliseCollection,
	createPreviouslyCardIds,
} from 'util/shared';

describe('Shared utilities', () => {
	describe('denormaliseCollection', () => {
		it('should denormalise a collection from the application state', () => {
			expect(
				denormaliseCollection(stateWithCollection as any, 'exampleCollection'),
			).toEqual({
				...collection,
				// We re-add a blank draft value here. (We could keep it undefined, it just feels a little odd!)
				draft: [],
				previously: [],
			});
			expect(
				denormaliseCollection(
					stateWithCollectionAndSupporting as any,
					'exampleCollection',
				),
			).toEqual({
				...collectionWithSupportingArticles,
				draft: [],
				previously: [],
			});
		});
	});
	describe('normaliseCollectionWithNestedArticles', () => {
		it('should normalise an external collection, and provide the new collection and cards indexed by id with any empty groups added from the collection config', () => {
			const result = normaliseCollectionWithNestedArticles(
				collection,
				collectionConfig,
			);
			expect(result.normalisedCollection.live).toHaveLength(3);
			const [gId1, gId2, gId3] = result.normalisedCollection.live!;
			const g1Articles = result.groups[gId1].cards;
			const g2Articles = result.groups[gId2].cards;
			const g3Articles = result.groups[gId3].cards;
			expect(g1Articles).toHaveLength(0);
			expect(g2Articles).toHaveLength(1);
			expect(g3Articles).toHaveLength(2);
			const liveArticles = [...g1Articles, ...g2Articles, ...g3Articles];
			expect(result.cards[liveArticles[0]].id).toBe('article/live/0');
			expect(result.cards[liveArticles[1]].id).toBe('article/draft/1');
			expect(result.cards[liveArticles[2]].id).toBe('a/long/path/2');
		});
		it('should handle draft and previously keys', () => {
			const result = normaliseCollectionWithNestedArticles(
				{
					...collection,
					...{
						draft: [
							{
								id: 'article/live/2',
								frontPublicationDate: 3,
								publishedBy: 'Computers',
								meta: {},
							},
						],
						previously: [
							{
								id: 'article/live/3',
								frontPublicationDate: 4,
								publishedBy: 'Computers',
								meta: {},
							},
						],
					},
				},
				collectionConfig,
			);
			expect(result.normalisedCollection.live!.length).toEqual(3);
			expect(result.normalisedCollection.draft!.length).toEqual(3);
			expect(result.normalisedCollection.previously!.length).toEqual(3);
			expect(
				result.normalisedCollection.live!.every(
					(articleId: string) => typeof articleId === 'string',
				),
			).toBe(true);
			expect(
				result.normalisedCollection.draft!.every(
					(articleId: string) => typeof articleId === 'string',
				),
			).toBe(true);
			expect(
				result.normalisedCollection.previously!.every(
					(articleId: string) => typeof articleId === 'string',
				),
			).toBe(true);
			expect(Object.keys(result.cards).length).toEqual(5);
			const liveGroup2 = result.groups[result.normalisedCollection.live![1]];
			const draftGroup3 = result.groups[result.normalisedCollection.draft![2]];
			const prevGroup3 =
				result.groups[result.normalisedCollection.previously![2]];
			expect(result.cards[liveGroup2.cards[0]].id).toBe('article/live/0');
			expect(result.cards[draftGroup3.cards[0]].id).toBe('article/live/2');
			expect(result.cards[prevGroup3.cards[0]].id).toBe('article/live/3');
		});
		it('should insert a default group for empty collections', () => {
			const { groupsConfig, ...collectionConfigWithoutGroups } = collectionConfig;
			const result = normaliseCollectionWithNestedArticles(
				{
					...collection,
					...{ live: [] },
				},
				collectionConfigWithoutGroups,
			);
			expect(result.normalisedCollection.live).toHaveLength(1);
			expect(result.normalisedCollection.draft).toHaveLength(1);
			expect(result.normalisedCollection.previously).toHaveLength(1);
			expect(Object.keys(result.cards)).toHaveLength(0);
		});
		it('should normalise supporting cards', () => {
			const result = normaliseCollectionWithNestedArticles(
				collectionWithSupportingArticles,
				collectionConfig,
			);
			expect(result.normalisedCollection.live!.length).toEqual(3);
			expect(Object.keys(result.cards).length).toEqual(4);
			expect(
				Object.keys(result.cards).every(
					(articleId) =>
						!result.cards[articleId].meta.supporting ||
						result.cards[articleId].meta.supporting!.every(
							(id: string) => typeof id === 'string',
						),
				),
			).toBe(true);
		});

		it('should create a single group with with all cards when the collection config has no groups', () => {
			const result = normaliseCollectionWithNestedArticles(
				collectionWithoutGroups,
				{
					...collectionConfig,
					groupsConfig: undefined,
				},
			);
			const groupId = result.normalisedCollection.live![0];
			expect(result.groups[groupId].cards).toHaveLength(3);
		});
		it('should create different groups for cards belonging to different groups even if they are not specified in the config', () => {
			const result = normaliseCollectionWithNestedArticles(collection, {
				...collectionConfig,
				groupsConfig: undefined,
			});
			const groupId1 = result.normalisedCollection.live![0];
			expect(result.groups[groupId1].cards).toHaveLength(1);
			const groupId2 = result.normalisedCollection.live![1];
			expect(result.groups[groupId2].cards).toHaveLength(2);
		});
		it("should create empty groups for groups in the config which don't have cards in them", () => {
			const configWithExtraGroup = {
				...collectionConfig,
				...{ groups: ['extra', 'large', 'medium', 'small'] },
			};
			const result = normaliseCollectionWithNestedArticles(collection, {
				...configWithExtraGroup,
				groupsConfig: undefined,
			});
			expect(Object.keys(result.groups)).toHaveLength(4);
		});
	});
	describe('createPreviouslyCardIds', () => {
		it('should create an array of card ids of recently removed articles', () => {
			const result = createPreviouslyCardIds(
				collectionWithPreviously,
				normalisedCollectonWithPreviously,
			);
			expect(result).toHaveLength(2);
			expect(result).toEqual(['uuid1', 'uuid2']);
		});
	});
});
