import { updateImageScalingParams, liveRecipes } from '../recipeQuery';
import fetchMock from 'fetch-mock';

jest.mock('');
describe('updateImageScalingParams', () => {
	it('should correctly update a URL with scaling params', () => {
		expect(
			updateImageScalingParams(
				'https://i.guim.co.uk/img/media/8c8aafb89d2467f41d5cf9d1324f815fee71d54c/0_168_4080_5101/master/4080.jpg?width=1600&dpr=1&s=none',
			),
		).toEqual(
			'https://i.guim.co.uk/img/media/8c8aafb89d2467f41d5cf9d1324f815fee71d54c/0_168_4080_5101/master/4080.jpg?width=83&dpr=1&s=none',
		);
	});

	it('should not touch a URL without scaling params', () => {
		expect(
			updateImageScalingParams(
				'https://media.guim.co.uk/9d66c5c65237d92720f657cf839b7754e0973286/527_409_4231_2539/500.jpg',
			),
		).toEqual(
			'https://media.guim.co.uk/9d66c5c65237d92720f657cf839b7754e0973286/527_409_4231_2539/500.jpg',
		);
	});
});

describe('recipeQueries.recipes', () => {
	afterEach(() => {
		fetchMock.restore();
	});

	it('should pull in all returned recipes and embellish them with the score', async () => {
		const body = JSON.stringify({
			results: [
				{
					score: 0.8,
					href: '/content/content1',
				},
				{
					score: 0.7,
					href: '/content/content2',
				},
			],
			maxScore: 0.8,
			hits: 2,
		});

		fetchMock.mock('https://recipes.guardianapis.com/search', 200, {
			response: {
				body,
			},
			method: 'POST',
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content1', 200, {
			response: {
				body: JSON.stringify({ fake: 'content here' }),
			},
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content2', 200, {
			response: {
				body: JSON.stringify({ more_fake: 'content here' }),
			},
		});

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(response.recipes.length).toEqual(2);
		expect(response.recipes[0].score).toEqual(0.8);
		expect(response.recipes[1].score).toEqual(0.7);
		expect(response.hits).toEqual(2);
		expect(response.maxScore).toEqual(0.8);
	});

	it('should ignore invalid urls', async () => {
		const body = JSON.stringify({
			results: [
				{
					score: 0.8,
					href: '/content/content1',
				},
				{
					score: 0.7,
					href: '/content/content2',
				},
			],
			maxScore: 0.8,
			hits: 2,
		});

		fetchMock.mock('https://recipes.guardianapis.com/search', 200, {
			response: {
				body,
			},
			method: 'POST',
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content1', 403, {
			response: {
				status: 403,
				body: '<html><body><h1>Content is not here!</h1></body></html>',
			},
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content2', 200, {
			response: {
				status: 200,
				body: JSON.stringify({ more_fake: 'content here' }),
			},
		});

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(response.recipes.length).toEqual(1);
		expect(response.recipes[0].score).toEqual(0.7);
		expect(response.hits).toEqual(2);
		expect(response.maxScore).toEqual(0.8);
	});

	it('should ignore corrupted content', async () => {
		const body = JSON.stringify({
			results: [
				{
					score: 0.8,
					href: '/content/content1',
				},
				{
					score: 0.7,
					href: '/content/content2',
				},
			],
			maxScore: 0.8,
			hits: 2,
		});

		fetchMock.mock('https://recipes.guardianapis.com/search', 200, {
			response: {
				body,
			},
			method: 'POST',
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content1', 200, {
			response: {
				body: 'THIS IS NOT JSON!',
			},
		});

		fetchMock.mock('https://recipes.guardianapis.com/content/content2', 200, {
			response: {
				body: JSON.stringify({ more_fake: 'content here' }),
			},
		});

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(response.recipes.length).toEqual(1);
		expect(response.recipes[0].score).toEqual(0.7);
		expect(response.hits).toEqual(2);
		expect(response.maxScore).toEqual(0.8);
	});
});

describe('recipeQueries.recipesById', () => {
	beforeEach(() => {
		fetchMock.restore();
	});

	it('should load in a batch of recipes', async () => {
		const idList = [
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'33a8c9a9609fada8ec28a9be1e068d8d01cae530',
			'72603cd9828849729fd50bc4b3dd6f1b',
		];

		fetchMock
			.get('begin:/recipes/api/content/by-uid?ids=', {
				status: 'ok',
				resolved: 40,
				requested: 40,
				results: [
					{
						checksum: 'FCPXAy6wwnLHs6t3oYNk5hu_CpzF2ECgCfdrX_G67AQ',
						recipeUID: '2bf50440adfff3b634fe471dfb778b21a1353787',
						capiArticleId:
							'lifeandstyle/2015/oct/10/lentil-recipes-get-ahead-urban-rajah-ivor-peters',
						sponsorshipCount: 0,
					},
					{
						checksum: 'UBVUs056cPnicu2GbbA479qpZCO2CHJZmnSYglFfTxQ',
						recipeUID: '33a8c9a9609fada8ec28a9be1e068d8d01cae530',
						capiArticleId:
							'lifeandstyle/2018/jan/06/egg-recipes-yotam-ottolenghi-harissa-manchego-omelette-scrambled-croque-madame',
						sponsorshipCount: 0,
					},
					{
						checksum: 'Mi3FUm1TVfCK45Y24ZmFvQbWMZ-NTQHRxBacVgwYUw8',
						recipeUID: '72603cd9828849729fd50bc4b3dd6f1b',
						capiArticleId:
							'food/2024/apr/21/sticky-aubergine-tart-sea-bass-pistachio-pesto-baklava-cheesecake-greekish-recipes-georgina-hayden',
						sponsorshipCount: 0,
					},
				],
			})
			.get(
				'https://recipes.guardianapis.com/content/FCPXAy6wwnLHs6t3oYNk5hu_CpzF2ECgCfdrX_G67AQ',
				{
					id: '2bf50440adfff3b634fe471dfb778b21a1353787',
				},
			)
			.get(
				'https://recipes.guardianapis.com/content/UBVUs056cPnicu2GbbA479qpZCO2CHJZmnSYglFfTxQ',
				{
					id: '33a8c9a9609fada8ec28a9be1e068d8d01cae530',
				},
			)
			.get(
				'https://recipes.guardianapis.com/content/Mi3FUm1TVfCK45Y24ZmFvQbWMZ-NTQHRxBacVgwYUw8',
				{
					id: '72603cd9828849729fd50bc4b3dd6f1b',
				},
			);

		const results = await liveRecipes.recipesById(idList);
		expect(results.length).toEqual(3);
		expect(results.map((_) => _.id)).toEqual(idList);
	});

	it("should not panic if a recipe can't be found", async () => {
		const idList = [
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'33a8c9a9609fada8ec28a9be1e068d8d01cae530',
			'72603cd9828849729fd50bc4b3dd6f1b',
		];

		fetchMock
			.get('begin:/recipes/api/content/by-uid?ids=', {
				status: 'ok',
				resolved: 40,
				requested: 40,
				results: [
					{
						checksum: 'FCPXAy6wwnLHs6t3oYNk5hu_CpzF2ECgCfdrX_G67AQ',
						recipeUID: '2bf50440adfff3b634fe471dfb778b21a1353787',
						capiArticleId:
							'lifeandstyle/2015/oct/10/lentil-recipes-get-ahead-urban-rajah-ivor-peters',
						sponsorshipCount: 0,
					},
					{
						checksum: 'UBVUs056cPnicu2GbbA479qpZCO2CHJZmnSYglFfTxQ',
						recipeUID: '33a8c9a9609fada8ec28a9be1e068d8d01cae530',
						capiArticleId:
							'lifeandstyle/2018/jan/06/egg-recipes-yotam-ottolenghi-harissa-manchego-omelette-scrambled-croque-madame',
						sponsorshipCount: 0,
					},
					{
						checksum: 'Mi3FUm1TVfCK45Y24ZmFvQbWMZ-NTQHRxBacVgwYUw8',
						recipeUID: '72603cd9828849729fd50bc4b3dd6f1b',
						capiArticleId:
							'food/2024/apr/21/sticky-aubergine-tart-sea-bass-pistachio-pesto-baklava-cheesecake-greekish-recipes-georgina-hayden',
						sponsorshipCount: 0,
					},
				],
			})
			.get(
				'https://recipes.guardianapis.com/content/FCPXAy6wwnLHs6t3oYNk5hu_CpzF2ECgCfdrX_G67AQ',
				{
					id: '2bf50440adfff3b634fe471dfb778b21a1353787',
				},
			)
			.get(
				'https://recipes.guardianapis.com/content/UBVUs056cPnicu2GbbA479qpZCO2CHJZmnSYglFfTxQ',
				{
					status: 404,
				},
			)
			.get(
				'https://recipes.guardianapis.com/content/Mi3FUm1TVfCK45Y24ZmFvQbWMZ-NTQHRxBacVgwYUw8',
				{
					id: '72603cd9828849729fd50bc4b3dd6f1b',
				},
			);

		const results = await liveRecipes.recipesById(idList);
		expect(results.length).toEqual(2);
		expect(results.map((_) => _.id)).toEqual([
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'72603cd9828849729fd50bc4b3dd6f1b',
		]);
	});
});
