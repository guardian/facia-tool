import { Move } from 'lib/dnd';
import { Card as TCard } from 'types/Collection';

// This is the card that is being moved,
export const baseData = {
	id: 'internal-code/page/15321140',
	frontPublicationDate: 1741796000533,
	meta: {
		supporting: ['card-6'],
	},
	// This is the uuid of the card that is being moved
	uuid: '',
};

export const card = {
	id: 'internal-code/page/15334368',
	frontPublicationDate: 1741879217277,
	meta: {
		supporting: [],
	},
	uuid: 'card-1',
};

export const baseGroupsData = [
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
		cards: ['card-2', 'card-3'],
		name: 'very big',
		maxItems: 2,
		cardsData: [
			{ ...card, uuid: 'card-2' },
			{ ...card, uuid: 'card-3' },
		],
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
			{
				...card,
				meta: {
					supporting: [
						'3628bc59-52da-47af-84f2-f6db1b32010d',
						'10f6dd4f-f81b-40cc-a073-195810065c81',
						'86de59ee-0c45-4b60-bea0-0c35042326aa',
						'60b32937-97a7-4ec1-9559-b0e384a343c4',
					],
				},
				uuid: 'card-5',
			},
			{ ...card, uuid: 'card-6' },
			{ ...card, uuid: 'card-7' },
		],
	},
];
// This is the group that the card is being moved to
export const baseTo = {
	// This is the index within the group to move the card to
	index: 0,
	type: 'group',
	id: 'group-0',
	collectionId: 'da9953a2-6116-4e8d-9d62-f245fe65f399',
	groupName: 'splash',
	groupIds: ['group-0', 'group-1', 'group-2', 'group-3'],
	groupMaxItems: 1,
	groupsData: baseGroupsData,
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

export const baseFrom = {
	type: 'group',
	id: 'group-3',
	index: 0,
};

export const baseFront: Move<TCard> = {
	data: baseData,
	to: baseTo,
	from: baseFrom,
};
