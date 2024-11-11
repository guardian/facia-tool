import configureMockStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import { createArticleEntitiesFromDrop } from '../Cards';
import { cardsReceived } from '../CardsCommon';
import initialState from 'fixtures/initialStateForEditions';
import { capiArticle } from '../../fixtures/shared';
import { actionNames as externalArticleActionNames } from 'bundles/externalArticlesBundle';
import { createCard } from 'util/card';
import { RefDrop } from 'util/collectionUtils';

jest.mock('uuid/v4', () => () => 'card1');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const idDrop = (id: string): RefDrop => ({ type: 'REF', data: id });

describe('Editions cards actions', () => {
	const { confirm } = window;
	const localNow = Date.now;
	const localGetTime = Date.prototype.getTime;
	const mockNow = jest.fn(() => 1487076708000);
	beforeAll(() => {
		Date.prototype.getTime = mockNow;
		Date.now = mockNow;
	});
	afterAll(() => {
		(window as any).confirm = confirm;
		Date.prototype.getTime = localGetTime;
		Date.now = localNow;
	});
	afterEach(() => fetchMock.restore());
	describe('addCard', () => {
		it('should fetch an article and create a corresponding editions card representing an article', async () => {
			fetchMock.once('begin:/api/preview', {
				response: {
					results: [capiArticle],
				},
			});
			const store = mockStore(initialState);
			await store.dispatch(
				createArticleEntitiesFromDrop(
					idDrop('internal-code/page/5029528'),
				) as any,
			);
			const actions = store.getActions();
			expect(actions[0].type).toEqual(externalArticleActionNames.fetchSuccess);
			expect(actions[1]).toEqual(
				cardsReceived({
					card1: createCard('internal-code/page/5029528', true),
				}),
			);
		});
	});
});
