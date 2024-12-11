import fetchMock from 'fetch-mock';
import configureStore from '../../util/configureStore';
import { fetchKeywords, selectors } from '../feastKeywordBundle';

const quickTimeout = () =>
	new Promise((resolve) => window.setTimeout(resolve, 10));

describe('feastKeywordBundle', () => {
	beforeEach(() => fetchMock.reset());

	it('should fetch celebrations and return them when asked', async () => {
		const store = configureStore();
		fetchMock.once('https://recipes.guardianapis.com/keywords/celebrations', {
			celebrations: [
				{
					key: 'christmas',
					doc_count: 3,
				},
				{
					key: 'birthday',
					doc_count: 2,
				},
				{
					key: 'veganuary',
					doc_count: 2,
				},
				{
					key: 'bank-holiday',
					doc_count: 1,
				},
				{
					key: 'boxing-day',
					doc_count: 1,
				},
			],
		});

		await store.dispatch(fetchKeywords('celebration') as any);
		await quickTimeout(); //if we don't await again, the store has not been updated yet.

		expect(selectors.selectCelebrationKeywords(store.getState())).toEqual([
			'christmas',
			'birthday',
			'veganuary',
			'bank-holiday',
			'boxing-day',
		]);
	});

	it('should fetch diets and return them when asked', async () => {
		const store = configureStore();
		fetchMock.once('https://recipes.guardianapis.com/keywords/diet-ids', {
			'diet-ids': [
				{
					key: 'vegetarian',
					doc_count: 66,
				},
				{
					key: 'gluten-free',
					doc_count: 37,
				},
				{
					key: 'meat-free',
					doc_count: 37,
				},
				{
					key: 'dairy-free',
					doc_count: 30,
				},
				{
					key: 'pescatarian',
					doc_count: 29,
				},
				{
					key: 'vegan',
					doc_count: 21,
				},
				{
					key: '',
					doc_count: 2,
				},
			],
		});

		await store.dispatch(fetchKeywords('diet') as any);
		await quickTimeout(); //if we don't await again, the store has not been updated yet.

		expect(selectors.selectDietKeywords(store.getState())).toEqual([
			'vegetarian',
			'gluten-free',
			'meat-free',
			'dairy-free',
			'pescatarian',
			'vegan',
		]);
	});
});
