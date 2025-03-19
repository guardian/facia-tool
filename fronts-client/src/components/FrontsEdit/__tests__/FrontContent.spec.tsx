import { Move } from 'lib/dnd';
import { Card as TCard } from 'types/Collection';

const mockFronts: Move<TCard> = {
	// This is the card that is being moved
	data: {
		id: 'internal-code/page/15321140',
		frontPublicationDate: 1741796000533,
		meta: {
			boostLevel: 'megaboost',
			supporting: [],
		},
		// This is the uuid of the card that is being moved
		uuid: '8f9e4e11-0e7e-45b9-a7ed-212d3a52af96',
	},
	// This is the group that the card is being moved to
	to: {
		// This is the index within the group to move the card to
		index: 0,
		type: 'group',
		id: '997ec76e-2afe-41a8-a015-e533ff2ac2b8',
		collectionId: 'da9953a2-6116-4e8d-9d62-f245fe65f399',
		groupName: 'splash',
		groupIds: [
			'997ec76e-2afe-41a8-a015-e533ff2ac2b8',
			'ca3903df-a922-4560-a201-e4e6353bc25b',
			'aa1cb937-bed4-4bd0-84d4-91b7ef112369',
			'5dfda8f1-029d-4ab2-a808-260506c4fc2a',
		],
		groupMaxItems: 1,
		groupsData: [
			{
				id: '3',
				uuid: '997ec76e-2afe-41a8-a015-e533ff2ac2b8',
				cards: ['3c29f8d1-916b-4a4e-afee-61a7ecc99206'],
				name: 'splash',
				maxItems: 1,
				cardsData: [
					{
						id: 'internal-code/page/15334368',
						frontPublicationDate: 1741879217277,
						meta: {
							boostLevel: 'default',
							supporting: [],
						},
						uuid: '3c29f8d1-916b-4a4e-afee-61a7ecc99206',
					},
				],
			},
			{
				id: '1',
				uuid: 'ca3903df-a922-4560-a201-e4e6353bc25b',
				cards: [
					'2dca7e69-855f-4fb1-a6e0-a537dd6b7885',
					'3a377cbb-84f1-4462-8ec5-0782436fb119',
				],
				name: 'big',
				maxItems: 2,
				cardsData: [
					{
						id: 'internal-code/page/15353882',
						frontPublicationDate: 1742312999498,
						meta: {
							boostLevel: 'boost',
							supporting: [],
						},
						uuid: '2dca7e69-855f-4fb1-a6e0-a537dd6b7885',
					},
					{
						id: 'internal-code/page/15352579',
						frontPublicationDate: 1742313001948,
						meta: {
							boostLevel: 'boost',
							supporting: [],
						},
						uuid: '3a377cbb-84f1-4462-8ec5-0782436fb119',
					},
				],
			},
			{
				id: null,
				uuid: 'aa1cb937-bed4-4bd0-84d4-91b7ef112369',
				cards: ['4d9b3fd5-f409-4e5f-98a0-46078e94167e'],
				name: 'standard',
				maxItems: 3,
				cardsData: [
					{
						id: 'internal-code/page/15323151',
						frontPublicationDate: 1741796000533,
						meta: {
							boostLevel: 'default',
							supporting: [
								'3628bc59-52da-47af-84f2-f6db1b32010d',
								'10f6dd4f-f81b-40cc-a073-195810065c81',
								'86de59ee-0c45-4b60-bea0-0c35042326aa',
								'60b32937-97a7-4ec1-9559-b0e384a343c4',
							],
						},
						uuid: '4d9b3fd5-f409-4e5f-98a0-46078e94167e',
					},
				],
			},
			{
				id: '2',
				uuid: '5dfda8f1-029d-4ab2-a808-260506c4fc2a',
				cards: [
					'8f9e4e11-0e7e-45b9-a7ed-212d3a52af96',
					'b881568b-5d50-469c-8998-ecae7945b537',
				],
				name: 'very big',
				maxItems: 2,
				cardsData: [
					{
						id: 'internal-code/page/15321140',
						frontPublicationDate: 1741796000533,
						meta: {
							boostLevel: 'megaboost',
							supporting: [],
						},
						uuid: '8f9e4e11-0e7e-45b9-a7ed-212d3a52af96',
					},
					{
						id: 'internal-code/page/15315807',
						frontPublicationDate: 1741796000533,
						meta: {
							boostLevel: 'megaboost',
							supporting: [
								'bda7d169-0602-4b24-af45-2760bf347951',
								'2ab24391-8919-440b-9f5d-aa1052dc3eb9',
								'2e09fe95-a217-4e78-baec-ee1c1e874217',
							],
						},
						uuid: 'b881568b-5d50-469c-8998-ecae7945b537',
					},
				],
			},
		],
		cards: [
			{
				id: 'internal-code/page/15334368',
				frontPublicationDate: 1741879217277,
				meta: {
					boostLevel: 'default',
					supporting: [],
				},
				uuid: '3c29f8d1-916b-4a4e-afee-61a7ecc99206',
			},
		],
	},
	from: {
		type: 'group',
		id: '5dfda8f1-029d-4ab2-a808-260506c4fc2a',
		index: 0,
	},
};

const handleNewMove = (move: Move<TCard>) => {
	const numberOfArticlesAlreadyInGroup = move.to.cards?.length ?? 0;
	const targetGroupHasFreeSpace =
		move.to.groupMaxItems !== numberOfArticlesAlreadyInGroup;
	if (targetGroupHasFreeSpace) return console.log('move easy card');

	const indexOfTargetGroup = move.to.groupIds?.indexOf(move.to?.id) ?? 0;
	const firstCard = move.data;

	const result = [];
	for (
		let index = indexOfTargetGroup;
		move.to.groupsData && index < move.to.groupsData.length;
		index++
	) {
		console.log({ index });
		console.log('result:: ', result);
		const group = move.to.groupsData?.[index];

		// If we don't have a group, we exit the loop
		if (!group) {
			console.log('no group');
			break;
		}

		// If we reach the target group, we add the first card to the group
		if (index === indexOfTargetGroup) {
			console.log(index, 'target group');

			result.push({
				to: {
					...move.to,
					id: group.uuid,
					groupMaxItems: group.maxItems,
					groupsData: move.to.groupsData,
					cards: group.cardsData,
				},
				data: firstCard,
				from: move.from || null,
				type: 'collection',
			});
			continue;
		}

		// If we reach a group with space, we exit the loop
		if (group.cardsData && group.cardsData.length < (group?.maxItems ?? 0)) {
			console.log(index, 'group with space');
			break;
		}
		//If we reach a full group that already contains the first card, then it isnt really full and we exit the loop
		if (group.cards.includes(firstCard.uuid)) {
			console.log(index, 'group with first card');
			break;
		}

		// We've reached a group that really is full, we move the last card to the next group
		console.log(index, 'full group');

		const lastCard = group.cardsData?.[group.cardsData.length - 1];
		const nextGroup = move.to.groupIds?.[index + 1];
		const nextGroupData =
			move.to.groupsData &&
			move.to.groupsData.find((group) => group.uuid === nextGroup);
		if (lastCard) {
			result.push({
				to: {
					index: 0,
					id: nextGroup,
					type: 'group',
					groupIds: move.to.groupIds,
					groupMaxItems: nextGroupData?.maxItems,
					groupsData: move.to.groupsData,
					cards: nextGroupData?.cardsData,
				},
				data: lastCard,
				from: false,
				type: 'collection',
			});
			continue;
		}
	}
};

// test handleNewMove function in the front content component
describe('handleNewMove', () => {
	it('should move a card to a new group', () => {
		handleNewMove(mockFronts);
	});
});
