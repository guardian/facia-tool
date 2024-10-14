import {
	selectNextClipboardIndexSelector,
	selectNextIndexAndGroup,
} from 'selectors/keyboardNavigationSelectors';
import { state } from 'fixtures/initialState';

describe('nextClipboardIndexSelector', () => {
	const stateWithClipboard = {
		...state,
		clipboard: ['id-1', 'id-2', 'id-3', 'id-4'],
	};

	it('return null when clipboard is empty', () => {
		const stateWithEmptyClipboard = { ...state, clipboard: [] };
		expect(
			selectNextClipboardIndexSelector(
				stateWithEmptyClipboard,
				'some-id',
				'up',
			),
		).toEqual(null);
	});

	it('return null when moving top article up', () => {
		expect(
			selectNextClipboardIndexSelector(stateWithClipboard, 'id-1', 'up'),
		).toEqual(null);
	});

	it('return next article when moving top article up', () => {
		expect(
			selectNextClipboardIndexSelector(stateWithClipboard, 'id-3', 'up'),
		).toEqual({ fromIndex: 2, toIndex: 1 });
	});

	it('return null when moving bottom article down', () => {
		expect(
			selectNextClipboardIndexSelector(stateWithClipboard, 'id-4', 'down'),
		).toEqual(null);
	});

	it('return next article when moving bottom article down', () => {
		expect(
			selectNextClipboardIndexSelector(stateWithClipboard, 'id-3', 'down'),
		).toEqual({ fromIndex: 2, toIndex: 3 });
	});
});

describe('nextIndexAndGroupSelector', () => {
	const groupsWithCards = {
		group1: {
			id: 'group1',
			name: 'groupname',
			uuid: 'group1',
			cards: ['card-1', 'card-2', 'card-3'],
		},
		group2: {
			id: 'group2',
			name: 'groupname',
			uuid: 'group2',
			cards: ['card-4', 'card-5', 'card-6'],
		},
		group3: {
			id: 'group3',
			name: 'groupname',
			uuid: 'group3',
			cards: ['card-7', 'card-8'],
		},
	};
	const cards = {
		'card-1': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-1',
		},
		'card-2': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-2',
		},
		'card-3': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-3',
		},
		'card-4': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-4',
		},
		'card-5': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-5',
		},
		'card-6': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-6',
		},
		'card-7': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-7',
		},
		'card-8': {
			id: 'internal-code/page/123',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: 'id-8',
		},
	};
	const collections = {
		data: {
			'e59785e9-ba82-48d8-b79a-0a80b2f9f808': {
				draft: ['group1', 'group2'],
				lastUpdated: 1547202598354,
				updatedBy: 'Name Surname',
				updatedEmail: 'email@email.co.uk',
				displayName: 'headlines',
				id: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
				type: 'fixed/small/slow-IV',
			},
			'c7f48719-6cbc-4024-ae92-1b5f9f6c0c99': {
				uneditable: true,
			},
			'4ab657ff-c105-4292-af23-cda00457b6b7': {
				draft: ['group3'],
				lastUpdated: 1547202598354,
				updatedBy: 'Name Surname',
				updatedEmail: 'email@email.co.uk',
				displayName: 'headlines',
				id: '4ab657ff-c105-4292-af23-cda00457b6b7',
				type: 'fixed/small/slow-IV',
			},
		},
		pagination: null,
		lastError: null,
		error: null,
		lastSuccessfulFetchTimestamp: null,
		loading: false,
		loadingIds: [],
		updatingIds: [],
	};
	const stateWithGroups = {
		...state,
		groups: groupsWithCards,
		cards,
		collections,
	};

	it('return null when moving articles in an empty group', () => {
		const emptyGroups = {
			group123: {
				id: 'gobbleygook',
				name: 'groupname',
				uuid: 'group123',
				cards: [],
			},
		};
		const stateWithEmptyGroup = {
			...state,
			groups: emptyGroups,
		};
		expect(
			selectNextIndexAndGroup(
				stateWithEmptyGroup,
				'gobbleygook',
				'some-id',
				'up',
				'sc-johnson-partner-zone',
			),
		).toEqual(null);
	});

	it('return null when moving top article in collection', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group1',
				'card-1',
				'up',
				'sc-johnson-partner-zone',
			),
		).toEqual(null);
	});

	it('return next group id and index when moving up article in collection', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group1',
				'card-2',
				'up',
				'sc-johnson-partner-zone',
			),
		).toEqual({ toIndex: 0, nextGroupId: 'group1' });
	});

	it('return null when moving bottom article in collection', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group3',
				'card-8',
				'down',
				'sc-johnson-partner-zone',
			),
		).toEqual(null);
	});

	it('return next group id and index when moving down article in collection', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group1',
				'card-2',
				'down',
				'sc-johnson-partner-zone',
			),
		).toEqual({ toIndex: 2, nextGroupId: 'group1' });
	});

	it('return next group id when moving down between groups', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group1',
				'card-3',
				'down',
				'sc-johnson-partner-zone',
			),
		).toEqual({ toIndex: 0, nextGroupId: 'group2' });
	});

	it('return next group id when moving up between groups', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group2',
				'card-4',
				'up',
				'sc-johnson-partner-zone',
			),
		).toEqual({ toIndex: 3, nextGroupId: 'group1' });
	});

	it('return next group id when moving up between collections', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group3',
				'card-7',
				'up',
				'sc-johnson-partner-zone',
			),
		).toEqual({
			toIndex: 3,
			nextGroupId: 'group2',
			collectionId: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
		});
	});

	it('return next editable group id when moving down between collections', () => {
		expect(
			selectNextIndexAndGroup(
				stateWithGroups,
				'group2',
				'card-6',
				'down',
				'sc-johnson-partner-zone',
			),
		).toEqual({
			toIndex: 0,
			nextGroupId: 'group3',
			collectionId: '4ab657ff-c105-4292-af23-cda00457b6b7',
		});
	});
});
