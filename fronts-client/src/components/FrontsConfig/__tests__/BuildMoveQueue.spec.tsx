import { card } from 'fixtures/card';
import { buildMoveQueue } from '../FrontContent';
import { baseFront, baseTo } from './fixtures/groups.fixture';

describe('buildMoveQueue', () => {
	it('should move a card into the top of a group that is full and move the last card of that group into the next group', () => {
		const moveQueue = buildMoveQueue(baseFront);
		const card1 = {
			...baseFront,
			type: 'collection',
		};

		const card2 = {
			to: {
				id: 'group-1',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: baseFront.to.groupsData?.[1].maxItems,
				groupsData: baseFront.to.groupsData,
				cards: baseFront.to.groupsData?.[1].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: baseFront.to.groupsData?.[0].cardsData?.[0],
			from: {
				type: 'group',
				id: 'group-0',
				index: 0,
			},
			type: 'collection',
		};

		const card3 = {
			to: {
				id: 'group-2',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: baseFront.to.groupsData?.[2].maxItems,
				groupsData: baseFront.to.groupsData,
				cards: baseFront.to.groupsData?.[2].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: baseFront.to.groupsData?.[1].cardsData?.[1],
			from: {
				type: 'group',
				id: 'group-1',
				index: 1,
			},
			type: 'collection',
		};

		const card4 = {
			to: {
				id: 'group-3',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: baseFront.to.groupsData?.[3].maxItems,
				groupsData: baseFront.to.groupsData,
				cards: baseFront.to.groupsData?.[3].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: baseFront.to.groupsData?.[2].cardsData?.[1],
			from: {
				type: 'group',
				id: 'group-2',
				index: 1,
			},
			type: 'collection',
		};

		const expectedMoveQueue = [card1, card2, card3, card4];

		expect(moveQueue).toEqual(expectedMoveQueue);
	});
	it('if the groups are full empty full, and the card is moved to group 1, it should move the bottom card from group 1 to 2 and then stop', () => {
		const newFront = {
			...baseFront,
			to: {
				...baseTo,
				groupsData: [
					{
						id: '3',
						uuid: 'group-0',
						cards: ['card-1'],
						name: 'splash',
						maxItems: 1,
						cardsData: [card],
					},
					{
						id: '2',
						uuid: 'group-1',
						cards: [],
						name: 'very big',
						maxItems: 2,
						cardsData: [],
					},
					{
						id: '1',
						uuid: 'group-2',
						cards: ['card-4', 'card-5'],
						name: 'big',
						maxItems: 2,
						cardsData: [
							{ ...card, uuid: 'card-4' },
							{ ...card, uuid: 'card-5' },
						],
					},
					{
						id: null,
						uuid: 'group-3',
						cards: ['card-6', 'card-7', 'card-8'],
						name: 'standard',
						maxItems: 3,
						cardsData: [
							{ ...card, uuid: 'card-6' },
							{ ...card, uuid: 'card-7' },
							{ ...card, uuid: 'card-8' },
						],
					},
				],
			},
		};

		const moveQueue = buildMoveQueue(newFront);
		const card1 = { ...newFront, type: 'collection' };

		const card2 = {
			to: {
				id: 'group-1',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: newFront.to.groupsData[1].maxItems,
				groupsData: newFront.to.groupsData,
				cards: newFront.to.groupsData[1].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: newFront.to.groupsData[0].cardsData[0],
			from: {
				type: 'group',
				id: 'group-0',
				index: 0,
			},
			type: 'collection',
		};

		const expectedMoveQueue = [card1, card2];

		expect(moveQueue).toEqual(expectedMoveQueue);
	});
	it('if the card is moved to the bottom of a full group, it should move the card into the next group', () => {
		const newFront = {
			...baseFront,
			to: {
				...baseTo,
				index: 1,
			},
		};
		const moveQueue = buildMoveQueue(newFront);

		const card1 = {
			to: {
				id: 'group-1',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: newFront.to.groupsData[1].maxItems,
				groupsData: newFront.to.groupsData,
				cards: newFront.to.groupsData[1].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: newFront.data,
			from: newFront.from || null,
			type: 'collection',
		};

		const card2 = {
			to: {
				id: 'group-2',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: baseFront.to.groupsData?.[2].maxItems,
				groupsData: baseFront.to.groupsData,
				cards: baseFront.to.groupsData?.[2].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: baseFront.to.groupsData?.[1].cardsData?.[1],
			from: {
				type: 'group',
				id: 'group-1',
				index: 1,
			},
			type: 'collection',
		};

		const card3 = {
			to: {
				id: 'group-3',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: baseFront.to.groupsData?.[3].maxItems,
				groupsData: baseFront.to.groupsData,
				cards: baseFront.to.groupsData?.[3].cardsData,
				index: 0,
				collectionId: baseFront.to.collectionId,
			},
			data: baseFront.to.groupsData?.[2].cardsData?.[1],
			from: {
				type: 'group',
				id: 'group-2',
				index: 1,
			},
			type: 'collection',
		};

		const expectedMoveQueue = [card1, card2, card3];

		expect(moveQueue).toEqual(expectedMoveQueue);
	});
});
