import { updateImageScalingParams, liveRecipes } from '../recipeQuery';
import { FeastGraphQL } from '@guardian/feast-multiplatform-backend-api';

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
		jest.restoreAllMocks();
	});

	const buildRecipe = (overrides: Record<string, unknown> = {}) => ({
		id: 'content1',
		title: 'Recipe 1',
		contributors: [{ webTitle: 'Jane Doe' }],
		canonicalArticle: '/content/content1',
		firstPublishedDate: '2024-01-01',
		publishedDate: '2024-01-02',
		lastModifiedDate: '2024-01-03',
		featuredImage: { templateUrl: 'https://example.com/1' },
		appExclusiveBranding: false,
		...overrides,
	});

	const setupMock = (results: Array<{ score?: number; recipe?: any }>) =>
		jest.spyOn(FeastGraphQL.prototype, 'faciaRecipeSearch').mockResolvedValue({
			results,
			maxScore: Math.max(
				...results.map(
					(result: { score?: number; recipe?: any }) => result.score ?? 0,
				),
				0,
			),
		} as any);

	it('should pull in all returned recipes and embellish them with the score', async () => {
		const faciaRecipeSearchMock = setupMock([
			{
				score: 0.8,
				recipe: buildRecipe({ id: 'content1', title: 'Recipe 1' }),
			},
			{
				score: 0.7,
				recipe: buildRecipe({ id: 'content2', title: 'Recipe 2' }),
			},
		]);

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(faciaRecipeSearchMock).toHaveBeenCalledWith(
			'blah',
			null,
			'pescatarian',
			undefined,
		);
		expect(response.recipes.length).toEqual(2);
		expect(response.recipes[0].score).toEqual(0.8);
		expect(response.recipes[1].score).toEqual(0.7);
		expect(response.hits).toEqual(2);
		expect(response.maxScore).toEqual(0.8);
	});

	it('should ignore recipe entries without a recipe payload', async () => {
		const faciaRecipeSearchMock = setupMock([
			{ score: 0.9, recipe: null },
			{
				score: 0.8,
				recipe: buildRecipe({ id: 'content1', title: 'Recipe 1' }),
			},
			{
				score: 0.7,
				recipe: buildRecipe({ id: 'content2', title: 'Recipe 2' }),
			},
		]);

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(faciaRecipeSearchMock).toHaveBeenCalledWith(
			'blah',
			null,
			'pescatarian',
			undefined,
		);
		expect(response.recipes.length).toEqual(2);
		expect(response.recipes.map((recipe) => recipe.id)).toEqual([
			'content1',
			'content2',
		]);
		expect(response.maxScore).toEqual(0.9);
	});

	it('should allow missing optional metadata without crashing', async () => {
		const faciaRecipeSearchMock = setupMock([
			{
				score: 0.6,
				recipe: buildRecipe({
					id: 'content3',
					title: 'Recipe 3',
					contributors: [],
					canonicalArticle: undefined,
					firstPublishedDate: undefined,
					publishedDate: undefined,
					lastModifiedDate: undefined,
					featuredImage: undefined,
				}),
			},
		]);

		const response = await liveRecipes.recipes({
			queryText: 'blah',
			filters: {
				diets: ['pescatarian'],
				filterType: 'Post',
			},
		});

		expect(faciaRecipeSearchMock).toHaveBeenCalledWith(
			'blah',
			null,
			'pescatarian',
			undefined,
		);
		expect(response.recipes).toHaveLength(1);
		expect(response.recipes[0]).toMatchObject({
			id: 'content3',
			title: 'Recipe 3',
			byline: [],
			canonicalArticle: '',
			firstPublishedDate: '',
			publishedDate: '',
			lastModifiedDate: '',
			imageTemplateUrl: undefined,
		});
		expect(response.maxScore).toEqual(0.6);
	});
});

describe('recipeQueries.recipesById', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should load in a batch of recipes', async () => {
		const idList = [
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'33a8c9a9609fada8ec28a9be1e068d8d01cae530',
			'72603cd9828849729fd50bc4b3dd6f1b',
		];
		const getRecipeBatchMock = jest
			.spyOn(FeastGraphQL.prototype, 'getRecipeBatch')
			.mockResolvedValue([
				{
					id: '2bf50440adfff3b634fe471dfb778b21a1353787',
					title: 'Recipe 1',
					contributors: [{ webTitle: 'Jane Doe' }],
					firstPublishedDate: '2024-01-01',
					lastModifiedDate: '2024-01-03',
					publishedDate: '2024-01-02',
					canonicalArticle: '/content/content1',
					featuredImage: { templateUrl: 'https://example.com/1' },
					appExclusiveBranding: false,
				},
				{
					id: '33a8c9a9609fada8ec28a9be1e068d8d01cae530',
					title: 'Recipe 2',
					contributors: [{ webTitle: 'John Smith' }],
					firstPublishedDate: '2024-01-04',
					lastModifiedDate: '2024-01-06',
					publishedDate: '2024-01-05',
					canonicalArticle: '/content/content2',
					featuredImage: { templateUrl: 'https://example.com/2' },
					appExclusiveBranding: false,
				},
				{
					id: '72603cd9828849729fd50bc4b3dd6f1b',
					title: 'Recipe 3',
					contributors: [{ webTitle: 'Alex Example' }],
					firstPublishedDate: '2024-01-07',
					lastModifiedDate: '2024-01-09',
					publishedDate: '2024-01-08',
					canonicalArticle: '/content/content3',
					featuredImage: { templateUrl: 'https://example.com/3' },
					appExclusiveBranding: false,
				},
			]);

		const results = await liveRecipes.recipesById(idList);
		expect(getRecipeBatchMock).toHaveBeenCalledWith(idList);
		expect(results.length).toEqual(3);
		expect(results.map((_) => _.id)).toEqual(idList);
	});

	it("should not panic if a recipe can't be found", async () => {
		const idList = [
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'33a8c9a9609fada8ec28a9be1e068d8d01cae530',
			'72603cd9828849729fd50bc4b3dd6f1b',
		];
		const getRecipeBatchMock = jest
			.spyOn(FeastGraphQL.prototype, 'getRecipeBatch')
			.mockResolvedValue([
				{
					id: '2bf50440adfff3b634fe471dfb778b21a1353787',
					title: 'Recipe 1',
					contributors: [{ webTitle: 'Jane Doe' }],
					firstPublishedDate: '2024-01-01',
					lastModifiedDate: '2024-01-03',
					publishedDate: '2024-01-02',
					canonicalArticle: '/content/content1',
					featuredImage: { templateUrl: 'https://example.com/1' },
					appExclusiveBranding: false,
				},
				{
					id: '72603cd9828849729fd50bc4b3dd6f1b',
					title: 'Recipe 3',
					contributors: [{ webTitle: 'Alex Example' }],
					firstPublishedDate: '2024-01-07',
					lastModifiedDate: '2024-01-09',
					publishedDate: '2024-01-08',
					canonicalArticle: '/content/content3',
					featuredImage: { templateUrl: 'https://example.com/3' },
					appExclusiveBranding: false,
				},
			]);

		const results = await liveRecipes.recipesById(idList);
		expect(getRecipeBatchMock).toHaveBeenCalledWith(idList);
		expect(results.length).toEqual(2);
		expect(results.map((_) => _.id)).toEqual([
			'2bf50440adfff3b634fe471dfb778b21a1353787',
			'72603cd9828849729fd50bc4b3dd6f1b',
		]);
	});
});
