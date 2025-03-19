import { card } from 'fixtures/card';
import { makeMoveQueue } from '../FrontContent';
import { baseFront, baseTo } from './fixtures/groups.fixture';

describe('HandleMove', () => {
	it('should move a card into the top of a group that is full and move the last card of that group into the next group', () => {
		const moveQueue = makeMoveQueue(baseFront);
		const card1 = {
			to: baseFront.to,
			data: baseFront.data,
			from: baseFront.from || null,
			type: 'collection',
		};

		const card2GroupMaxItems =
			baseFront.to.groupsData && baseFront.to.groupsData[1].maxItems;
		const card2Cards =
			baseFront.to.groupsData && baseFront.to.groupsData[1].cardsData;
		const card2Data =
			baseFront.to.groupsData &&
			baseFront.to.groupsData[0].cardsData &&
			baseFront.to.groupsData[0].cardsData[0];
		const card2 = {
			to: {
				id: 'group-1',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: card2GroupMaxItems,
				groupsData: baseFront.to.groupsData,
				cards: card2Cards,
				index: 0,
			},
			data: card2Data,
			from: {
				type: 'group',
				id: 'group-0',
				index: 0,
			},
			type: 'collection',
		};

		const card3GroupMaxItems =
			baseFront.to.groupsData && baseFront.to.groupsData[2].maxItems;
		const card3Cards =
			baseFront.to.groupsData && baseFront.to.groupsData[2].cardsData;
		const card3Data =
			baseFront.to.groupsData &&
			baseFront.to.groupsData[1].cardsData &&
			baseFront.to.groupsData[1].cardsData[1];
		const card3 = {
			to: {
				id: 'group-2',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: card3GroupMaxItems,
				groupsData: baseFront.to.groupsData,
				cards: card3Cards,
				index: 0,
			},
			data: card3Data,
			from: {
				type: 'group',
				id: 'group-1',
				index: 1,
			},
			type: 'collection',
		};

		const card4GroupMaxItems =
			baseFront.to.groupsData && baseFront.to.groupsData[3].maxItems;
		const card4Cards =
			baseFront.to.groupsData && baseFront.to.groupsData[3].cardsData;
		const card4Data =
			baseFront.to.groupsData &&
			baseFront.to.groupsData[2].cardsData &&
			baseFront.to.groupsData[2].cardsData[1];
		const card4 = {
			to: {
				id: 'group-3',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: card4GroupMaxItems,
				groupsData: baseFront.to.groupsData,
				cards: card4Cards,
				index: 0,
			},
			data: card4Data,
			from: {
				type: 'group',
				id: 'group-2',
				index: 1,
			},
			type: 'collection',
		};

		const expectedMoveQueue = [card1, card2, card3, card4];
		console.log('here we go', 'em', expectedMoveQueue[0], 'mq', moveQueue[0]);
		console.log('here we go 2', 'em', expectedMoveQueue[1], 'mq', moveQueue[1]);
		console.log('here we go 3', 'em', expectedMoveQueue[2], 'mq', moveQueue[2]);
		console.log('here we go 4', 'em', expectedMoveQueue[3], 'mq', moveQueue[3]);

		expect(expectedMoveQueue[0]).toStrictEqual(moveQueue[0]);
		expect(expectedMoveQueue[1]).toStrictEqual(moveQueue[1]);
		expect(expectedMoveQueue[2]).toStrictEqual(moveQueue[2]);
		expect(expectedMoveQueue[3]).toStrictEqual(moveQueue[3]);
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

		const moveQueue = makeMoveQueue(newFront);
		const card1 = {
			to: newFront.to,
			data: newFront.data,
			from: newFront.from || null,
			type: 'collection',
		};

		const card2 = {
			to: {
				id: 'group-1',
				type: 'group',
				groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
				groupMaxItems: newFront.to.groupsData[1].maxItems,
				groupsData: newFront.to.groupsData,
				cards: newFront.to.groupsData[1].cardsData,
				index: 0,
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
		console.log('here we go', expectedMoveQueue[0], moveQueue[0]);
		console.log('here we go 2', expectedMoveQueue[1], moveQueue[1]);

		expect(expectedMoveQueue[0]).toStrictEqual(moveQueue[0]);
		expect(expectedMoveQueue[1]).toStrictEqual(moveQueue[1]);
	});
	it('if the card is moved to the bottom of a full group, it should move the card into the next group', () => {
		// TODO - Will Fail
		const moveQueue = makeMoveQueue(baseFront);
		expect(moveQueue.length).toBe(3);
	});
	// it('should keep its sublinks when a card is moved', () => {
	// 	// TODO
	// });
	// it('should move a card into a group that has space', () => {
	// 	// TODO
	// });
	// it('should move a card within its existing group', () => {
	// 	// TODO
	// });
	// it('should always move the card into a standard group', () => {
	// 	// TODO
	// });
});
