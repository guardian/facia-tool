import configureStore from 'util/configureStore';
import fetchMock from 'fetch-mock';
import { fetchChefs, fetchChefsById } from '../chefsBundle';
import { selectors as chefSelectors } from 'bundles/chefsBundle';

interface MockedResponse {
	pattern: string;
	response: any;
}

const createStoreAndFetchMock = (fetchResponses: MockedResponse[]) => {
	fetchResponses.forEach((r) => {
		fetchMock.once(r.pattern, r.response, { overwriteRoutes: true });
	});
	return configureStore();
};

const annaMockRecipe = {
	hits: 7,
	results: [
		{
			contributorType: 'Profile',
			nameOrId: 'profile/anna-jones',
			docCount: 182,
		},
		{
			contributorType: 'Byline',
			nameOrId: 'Anna Haugh',
			docCount: 6,
		},
		{
			contributorType: 'Byline',
			nameOrId: 'Anna Tobias',
			docCount: 4,
		},
		{
			contributorType: 'Profile',
			nameOrId: 'profile/anna-del-conte',
			docCount: 3,
		},
		{
			contributorType: 'Byline',
			nameOrId: 'Anna Higham',
			docCount: 2,
		},
		{
			contributorType: 'Byline',
			nameOrId: 'Anna Jones',
			docCount: 1,
		},
		{
			contributorType: 'Byline',
			nameOrId: 'Tim Lannan and James Annabel',
			docCount: 1,
		},
	],
};
const tagLookupResponse = {
	response: {
		status: 'ok',
		userTier: 'internal',
		total: 2,
		startIndex: 1,
		pageSize: 20,
		currentPage: 1,
		pages: 1,
		results: [
			{
				id: 'profile/anna-del-conte',
				type: 'contributor',
				webTitle: 'Anna Del Conte',
				webUrl: 'https://www.theguardian.com/profile/anna-del-conte',
				apiUrl: 'https://content.guardianapis.com/profile/anna-del-conte',
				bio: '<p>Anna Del Conte is the doyenne of Italian cookery. In 2011 Nigella Lawson presented her with the Lifetime Achievement Award of the Guild of Food Writers.</p>',
				firstName: 'del',
				lastName: 'conteanna',
				r2ContributorId: '66638',
				internalName: 'Anna Del Conte',
			},
			{
				id: 'profile/anna-jones',
				type: 'contributor',
				webTitle: 'Anna Jones',
				webUrl: 'https://www.theguardian.com/profile/anna-jones',
				apiUrl: 'https://content.guardianapis.com/profile/anna-jones',
				bio: '<p>Anna Jones is a chef, writer​,​ and author of A Modern Way to Eat and A Modern Way to Cook</p>',
				bylineImageUrl: 'https://uploads.guim.co.uk/2018/01/29/Anna-Jones.jpg',
				bylineLargeImageUrl:
					'https://uploads.guim.co.uk/2018/01/29/Anna_Jones,_L.png',
				firstName: 'Anna',
				lastName: 'Jones',
				r2ContributorId: '64120',
				internalName: 'Anna Jones',
			},
		],
	},
};
const expectedResultForLookup = {
	'profile/anna-del-conte': {
		apiUrl: 'https://content.guardianapis.com/profile/anna-del-conte',
		bio: '',
		firstName: 'del',
		id: 'profile/anna-del-conte',
		internalName: 'Anna Del Conte',
		lastName: 'conteanna',
		r2ContributorId: '66638',
		type: 'contributor',
		webTitle: 'Anna Del Conte',
		webUrl: 'https://www.theguardian.com/profile/anna-del-conte',
	},
	'profile/anna-jones': {
		apiUrl: 'https://content.guardianapis.com/profile/anna-jones',
		bio: '',
		bylineImageUrl: 'https://uploads.guim.co.uk/2018/01/29/Anna-Jones.jpg',
		bylineLargeImageUrl:
			'https://uploads.guim.co.uk/2018/01/29/Anna_Jones,_L.png',
		firstName: 'Anna',
		id: 'profile/anna-jones',
		internalName: 'Anna Jones',
		lastName: 'Jones',
		r2ContributorId: '64120',
		type: 'contributor',
		webTitle: 'Anna Jones',
		webUrl: 'https://www.theguardian.com/profile/anna-jones',
	},
};
const quickTimeout = () =>
	new Promise((resolve) => window.setTimeout(resolve, 10));

describe('chefsBundle', () => {
	beforeEach(() => fetchMock.reset());

	it('fetchChefs should fetch chefs by param, look up CAPI details for profile tags, and add them to the state', async () => {
		const store = createStoreAndFetchMock([
			{
				pattern:
					'https://recipes.guardianapis.com/keywords/contributors?q=anna',
				response: annaMockRecipe,
			},
			{
				pattern:
					'/api/live/tags?type=contributor&ids=profile%2Fanna-jones%2Cprofile%2Fanna-del-conte&show-elements=image&show-fields=all&page-size=20',
				response: tagLookupResponse,
			},
		]);
		await store.dispatch(fetchChefs({ query: 'anna' }) as any);
		await quickTimeout(); //if we don't await again, the store has not been updated yet.
		expect(chefSelectors.selectAll(store.getState())).toEqual(
			expectedResultForLookup,
		);
	});

	it('fetchChefsById should look up CAPI details for profile tags', async () => {
		const store = createStoreAndFetchMock([
			{
				pattern:
					'/api/live/tags?type=contributor&ids=profile%2Fanna-jones%2Cprofile%2Fanna-del-conte&show-elements=image&show-fields=all&page-size=20',
				response: tagLookupResponse,
			},
		]);
		await store.dispatch(
			fetchChefsById(
				['profile/anna-jones', 'profile/anna-del-conte'],
				1,
				20,
				true,
			) as any,
		);
		expect(chefSelectors.selectAll(store.getState())).toEqual(
			expectedResultForLookup,
		);
	});
});
