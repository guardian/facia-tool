import {
	selectFrontsWithPriority,
	createSelectArticleVisibilityDetails,
} from 'selectors/frontsSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';
import { editorialFrontsInConfig, commercialFronts } from './mock-data';

describe('Filtering fronts correctly', () => {
	it('return an empty array if config is empty', () => {
		expect(
			selectFrontsWithPriority(
				{
					fronts: {
						frontsConfig: {
							data: {
								fronts: {},
							},
						},
					},
				} as any,
				'editorial',
			),
		).toEqual([]);
	});

	it('filters editorial fronts correctly', () => {
		expect(
			selectFrontsWithPriority(
				{
					fronts: {
						frontsConfig,
					},
				} as any,
				'editorial',
			),
		).toEqual(editorialFrontsInConfig);
	});

	it('filters non-editorial fronts correctly', () => {
		expect(
			selectFrontsWithPriority(
				{
					fronts: {
						frontsConfig,
					},
				} as any,
				'commercial',
			),
		).toEqual(commercialFronts);
	});
});

const visibilityState = {
	fronts: {
		collectionVisibility: {
			draft: {
				a: {
					desktop: 4,
					mobile: 3,
				},
			},
		},
	},
	collections: {
		data: {
			a: {
				draft: ['g1', 'g2'],
			},
		},
	},
	groups: {
		g1: {
			cards: ['a1', 'a2', 'a3'],
		},
		g2: {
			cards: ['a4', 'a5'],
		},
	},
	cards: {
		a1: {
			uuid: 'a1',
			meta: {
				// this tests that we ignore supporting articles
				supporting: ['a6'],
			},
		},
		a2: {
			uuid: 'a2',
		},
		a3: {
			uuid: 'a3',
		},
		a4: {
			uuid: 'a4',
		},
		a5: {
			uuid: 'a5',
		},
		a6: {
			uuid: 'a5',
		},
	},
};

describe('Article visibility selector', () => {
	it('returns the id of the card at the last visible position for mobile and desktop, ignoring supporting cards', () => {
		const selectArticleVisibilityDetails =
			createSelectArticleVisibilityDetails();
		expect(
			selectArticleVisibilityDetails(visibilityState as any, {
				collectionSet: 'draft',
				collectionId: 'a',
			}),
		).toEqual({
			desktop: 'a4',
			mobile: 'a3',
		});
	});
});
