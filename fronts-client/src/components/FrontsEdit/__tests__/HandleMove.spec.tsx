import { Move } from 'lib/dnd';
import { Card as TCard } from 'types/Collection';
import { makeMoveQueue } from '../FrontContent';
// This is the card that is being moved,
const data = {
	id: 'internal-code/page/15321140',
	frontPublicationDate: 1741796000533,
	meta: {
		supporting: ['card-6'],
	},
	// This is the uuid of the card that is being moved
	uuid: '',
};
// This is the group that the card is being moved to
const to = {
	// This is the index within the group to move the card to
	index: 0,
	type: 'group',
	id: 'group-0',
	collectionId: 'da9953a2-6116-4e8d-9d62-f245fe65f399',
	groupName: 'splash',
	groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
	groupMaxItems: 1,
	groupsData: [
		{
			id: '3',
			uuid: 'group-0',
			cards: ['card-1'],
			name: 'splash',
			maxItems: 1,
			cardsData: [
				{
					id: 'internal-code/page/15334368',
					frontPublicationDate: 1741879217277,
					meta: {
						supporting: [],
					},
					uuid: 'card-1',
				},
			],
		},
		{
			id: '2',
			uuid: 'group-1',
			cards: ['card-2', 'card-3'],
			name: 'very big',
			maxItems: 2,
			cardsData: [
				{
					id: 'internal-code/page/15321140',
					frontPublicationDate: 1741796000533,
					meta: {
						supporting: [],
					},
					uuid: 'card-2',
				},
				{
					id: 'internal-code/page/15315807',
					frontPublicationDate: 1741796000533,
					meta: {
						supporting: [
							'bda7d169-0602-4b24-af45-2760bf347951',
							'2ab24391-8919-440b-9f5d-aa1052dc3eb9',
							'2e09fe95-a217-4e78-baec-ee1c1e874217',
						],
					},
					uuid: 'card-3',
				},
			],
		},
		{
			id: '1',
			uuid: 'group-2',
			cards: ['card-4', 'card-5'],
			name: 'big',
			maxItems: 2,
			cardsData: [
				{
					id: 'internal-code/page/15353882',
					frontPublicationDate: 1742312999498,
					meta: {
						supporting: [],
					},
					uuid: 'card-4',
				},
				{
					id: 'internal-code/page/15352579',
					frontPublicationDate: 1742313001948,
					meta: {
						supporting: [],
					},
					uuid: 'card-5',
				},
			],
		},
		{
			id: null,
			uuid: 'group-3',
			cards: ['card-6', 'card-7', 'card-8'],
			name: 'standard',
			maxItems: 3,
			cardsData: [
				{
					id: 'internal-code/page/15323151',
					frontPublicationDate: 1741796000533,
					meta: {
						supporting: [
							'3628bc59-52da-47af-84f2-f6db1b32010d',
							'10f6dd4f-f81b-40cc-a073-195810065c81',
							'86de59ee-0c45-4b60-bea0-0c35042326aa',
							'60b32937-97a7-4ec1-9559-b0e384a343c4',
						],
					},
					uuid: 'card-6',
				},
				{
					id: 'internal-code/page/15320000',
					frontPublicationDate: 1741796000533,
					meta: {
						supporting: [],
					},
					uuid: 'card-7',
				},
				{
					id: 'internal-code/page/15423151',
					frontPublicationDate: 1741796000533,
					meta: {
						supporting: [],
					},
					uuid: 'card-7',
				},
			],
		},
	],
	cards: [
		{
			id: 'internal-code/page/15334368',
			frontPublicationDate: 1741879217277,
			meta: {
				supporting: [],
			},
			uuid: 'card-1',
		},
	],
};

const from = {
	type: 'group',
	id: 'group-3',
	index: 0,
};

const mockFronts: Move<TCard> = {
	data,
	to,
	from,
};

describe('HandleMove', () => {
	it('should move a card into a group that has space', () => {
		// TODO
	});
	it('should move a card within its existing group', () => {
		// TODO
	});
	it('should always move the card into a standard group', () => {
		// TODO
	});

	it('should move a card into the top of a group that is full and move the last card of that group into the next group', () => {
		const moveQueue = makeMoveQueue(mockFronts);
		expect(moveQueue.length).toBe(4);
	});
	it('if the card is moved to the bottom of a full group, it should move the card into the next group', () => {
		// TODO
	});
	it('if the groups are full full empty full, and the card is moved to group 1, it should move the bottom card from group 1 and 2 and stop at group 3', () => {
		// TODO
	});
	it('should keep its sublinks when a card is moved', () => {
		// TODO
	});
});
