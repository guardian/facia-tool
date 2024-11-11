import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { RecipeCard } from '../recipe/RecipeCard';
import configureStore from 'util/configureStore';
import { Provider } from 'react-redux';
import { theme } from '../../../constants/theme';
import { ThemeProvider } from 'styled-components';
import 'jest-styled-components';

const recipeFixture = {
	id: '5a7e272802fe46ef938b27f6a975f2f014d10c08',
	canonicalArticle:
		'lifeandstyle/2017/feb/19/ofm-classic-cookbook-claudia-roden-book-of-middle-eastern-food',
	title: 'Couscous with fish',
	featuredImage: {
		url: 'https://i.guim.co.uk/img/media/1ed867df389cae5b81489d94fbec616686426d59/0_2289_4912_2948/master/4912.jpg?width=1600&dpr=1&s=none',
		mediaId: '1ed867df389cae5b81489d94fbec616686426d59',
		cropId: '0_2289_4912_2948',
	},
	contributors: [],
	byline: [],
	ingredients: [
		{
			recipeSection: '',
			ingredientsList: [
				{
					amount: {
						min: 120,
						max: 120,
					},
					unit: 'g',
					name: 'chickpeas',
					optional: true,
				},
				{
					amount: {
						min: 3,
						max: 3,
					},
					unit: '',
					name: 'carrots',
					optional: true,
				},
				{
					amount: {
						min: 3,
						max: 3,
					},
					unit: '',
					name: 'turnips',
					optional: true,
				},
				{
					amount: {
						min: 1,
						max: 1,
					},
					unit: '',
					name: 'onion',
					optional: true,
				},
				{
					amount: {
						min: 1,
						max: 1,
					},
					unit: '',
					name: 'sweet green pepper',
					optional: true,
				},
				{
					unit: '',
					name: 'black pepper',
					optional: true,
				},
				{
					unit: '',
					name: 'Cayenne pepper',
					optional: true,
				},
				{
					amount: {
						min: 0.25,
						max: 0.25,
					},
					unit: 'tsp',
					name: 'saffron',
					optional: true,
				},
				{
					unit: 'g',
					name: 'couscous',
					optional: true,
				},
				{
					amount: {
						min: 750,
						max: 750,
					},
					unit: 'kg',
					name: 'fish',
					optional: true,
				},
				{
					unit: '',
					name: 'quinces',
					optional: true,
				},
			],
		},
	],
	suitableForDietIds: [],
	cuisineIds: ['north-african/moroccan', 'pan-african', 'middleeastern'],
	mealTypeIds: [],
	celebrationsIds: [],
	utensilsAndApplianceIds: [],
	techniquesUsedIds: [],
	serves: [],
	timings: [],
	instructions: [
		{
			stepNumber: 0,
			description:
				'Moisten the couscous slightly with a little cold water, working it in with the fingers to prevent lumps from forming.',
			images: [],
		},
		{
			stepNumber: 1,
			description: 'Turn it into the sieve part of the couscousier.',
			images: [],
		},
		{
			stepNumber: 2,
			description:
				'Rake the grains with your fingers to air them and help them to swell better.',
			images: [],
		},
		{
			stepNumber: 3,
			description: 'Do not cover the sieve.',
			images: [],
		},
		{
			stepNumber: 4,
			description: 'Steam over the simmering sauce for 30 minutes.',
			images: [],
		},
		{
			stepNumber: 5,
			description: 'Now turn the couscous into a large bowl.',
			images: [],
		},
		{
			stepNumber: 6,
			description:
				'Sprinkle generously with cold water and stir well with a wooden spoon to break up any lumps and to separate and air the grains.',
			images: [],
		},
		{
			stepNumber: 7,
			description: 'Add a little salt at this point if you like.',
			images: [],
		},
		{
			stepNumber: 8,
			description: 'The water will make the grains swell very much.',
			images: [],
		},
		{
			stepNumber: 9,
			description:
				'(A tablespoon of oil is sometimes added at the same time) Return to the top container and steam for a further 30 minutes.',
			images: [],
		},
		{
			stepNumber: 10,
			description: 'In a large pan, make a rich fish soup.',
			images: [],
		},
		{
			stepNumber: 11,
			description:
				'Boil the fish tails and heads with all the vegetables, salt, black and cayenne pepper and saffron in 1-1½ litres water.',
			images: [],
		},
		{
			stepNumber: 12,
			description: 'Remove the scum as it rises to the surface.',
			images: [],
		},
		{
			stepNumber: 13,
			description:
				'Simmer for an hour until the stock is rich and the vegetables are soft.',
			images: [],
		},
		{
			stepNumber: 14,
			description: 'Prepare the couscous as described above.',
			images: [],
		},
		{
			stepNumber: 15,
			description:
				'Put it in the sieve and steam it over the simmering fish stock for 30 minutes.',
			images: [],
		},
		{
			stepNumber: 16,
			description: 'Remove the couscous and treat it as previously described.',
			images: [],
		},
		{
			stepNumber: 17,
			description:
				'Remove the fish tails and heads from the stock, and if you like strain through a fine sieve, then return the vegetables to the stock.',
			images: [],
		},
		{
			stepNumber: 18,
			description: 'Lower in the whole fish, sliced if too large.',
			images: [],
		},
		{
			stepNumber: 19,
			description: 'Add the sliced quinces.',
			images: [],
		},
		{
			stepNumber: 20,
			description:
				'Return the couscous to the sieve and steam it over the simmering fish for a further 30 minutes, less if the pieces of fish are not large.',
			images: [],
		},
		{
			stepNumber: 21,
			description: 'Adjust the seasoning of the reduced fish stock.',
			images: [],
		},
		{
			stepNumber: 22,
			description:
				'Serve the fish and its sauce over the couscous in a large dish, or in separate dishes.',
			images: [],
		},
	],
	previewImage: {
		url: 'https://i.guim.co.uk/img/media/1ed867df389cae5b81489d94fbec616686426d59/0_2289_4912_2948/master/4912.jpg?width=1600&dpr=1&s=none',
		mediaId: '1ed867df389cae5b81489d94fbec616686426d59',
		cropId: '0_2289_4912_2948',
	},
	lastModifiedDate: '2017-02-10T11:34:22.000Z',
	firstPublishedDate: '2017-02-19T09:30:04.000Z',
	publishedDate: '2017-02-19T09:30:04.000Z',
};

describe('RecipeCard', () => {
	afterEach(cleanup);

	it('should render a recipe', async () => {
		const store = configureStore({
			feed: {},
			cards: {
				'test-recipe-card': {
					id: 'test-recipe-id',
				},
			},
			recipes: {
				data: {
					'test-recipe-id': recipeFixture,
				},
			},
		});

		const component = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<RecipeCard
						onDelete={jest.fn()}
						onAddToClipboard={jest.fn()}
						id="test-recipe-card"
						frontId="test-recipe-id"
					/>
				</ThemeProvider>
			</Provider>,
		);

		const headline = await component.findAllByTestId('headline');
		expect(headline).toHaveLength(1);
		expect(headline[0].textContent).toEqual('Couscous with fish');

		const metacontainer = await component.findAllByTestId('meta-container');
		expect(metacontainer).toHaveLength(1);
		expect(metacontainer[0]).toHaveStyleRule(
			'background-color',
			theme.colors.white,
		);

		expect(await component.findAllByText('Recipe', {})).toHaveLength(1);
		expect(component.queryByTestId('recipe-not-found-icon')).toBeNull();
	});

	it('should render a warning state if the recipe is not defined', async () => {
		const store = configureStore({
			feed: {},
			cards: {
				'test-recipe-card': {
					id: 'test-recipe-id',
				},
			},
			recipes: {
				data: {},
			},
		});

		const component = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<RecipeCard
						onDelete={jest.fn()}
						onAddToClipboard={jest.fn()}
						id="test-recipe-card"
						frontId="test-recipe-id"
					/>
				</ThemeProvider>
			</Provider>,
		);

		const headline = await component.findAllByTestId('headline');
		expect(headline).toHaveLength(1);
		expect(headline[0].textContent).toEqual(
			'This recipe might not load in the app, please select an alternative.',
		);

		const metacontainer = await component.findAllByTestId('meta-container');
		expect(metacontainer).toHaveLength(1);
		expect(metacontainer[0]).toHaveStyleRule(
			'background-color',
			theme.colors.greyMediumLight,
		);
		expect(component.queryByText('Recipe')).toBeNull();
		expect(
			await component.findAllByTestId('recipe-not-found-icon'),
		).toHaveLength(1);
	});
});
