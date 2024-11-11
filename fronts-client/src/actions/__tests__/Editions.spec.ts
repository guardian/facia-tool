import {
	apiResponseOnAddNewCollection,
	apiResponseOnRemoveACollection,
	finalStateWhenAddNewCollection,
	finalStateWhenRemoveACollection,
	initialState,
} from './fixtures/Editions.fixture';
import {
	addFrontCollection,
	getNewCollectionIndexForMove,
	removeFrontCollection,
} from '../Editions';
import configureStore from '../../util/configureStore';
import { Dispatch } from '../../types/Store';
import fetchMock from 'fetch-mock';

jest.mock('uuid/v4', () => () => 'uuid');

describe('Editions actions', () => {
	const { now } = Date;
	afterEach(fetchMock.restore);
	beforeAll(() => {
		(Date as any).now = () => 1337;
	});
	afterAll(() => {
		(Date as any).now = now;
	});

	const frontId = '3b73ae36-1b99-4102-b6cb-51cc66768182';

	describe('addFrontCollection', () => {
		it('should add new collection in the front', async () => {
			const store = configureStore(
				initialState,
				'/v2/issues/ae2035fa-7864-4c73-aabd-70ab70526bf7',
			);

			fetchMock.once(
				`/editions-api/fronts/${frontId}/collection`,
				apiResponseOnAddNewCollection,
				{
					method: 'PUT',
				},
			);

			await (store.dispatch as Dispatch)(addFrontCollection(frontId));

			const state = store.getState();
			expect(state).toEqual(finalStateWhenAddNewCollection);
		});
	});

	describe('removeFrontCollection', () => {
		it('should remove a collection in the front', async () => {
			const store = configureStore(
				initialState,
				'/v2/issues/ae2035fa-7864-4c73-aabd-70ab70526bf7',
			);
			const collectionId = 'bf3428ed-4ee8-4321-8099-6590d0b51fd6';
			fetchMock.once(
				`/editions-api/fronts/${frontId}/collection/${collectionId}`,
				apiResponseOnRemoveACollection,
				{ method: 'DELETE' },
			);
			await (store.dispatch as Dispatch)(
				removeFrontCollection(frontId, collectionId),
			);
			const state = store.getState();
			expect(state).toEqual(finalStateWhenRemoveACollection);
		});
	});

	describe('getNewCollectionIndexForMove', () => {
		const front =
			finalStateWhenAddNewCollection.fronts.frontsConfig.data.fronts[frontId];

		it('should get the correct index moving a collection up', async () => {
			const newIndex = getNewCollectionIndexForMove(
				front,
				'165193d5-3761-466c-af9a-4fc09fd91133',
				'down',
			);

			expect(newIndex).toBe(1);
		});

		it('should get the correct index moving a collection down', async () => {
			const newIndex = getNewCollectionIndexForMove(
				front,
				'165193d5-3761-466c-af9a-4fc09fd91133',
				'down',
			);

			expect(newIndex).toBe(1);
		});

		it('should get the correct index moving a collection down', async () => {
			const newIndex = getNewCollectionIndexForMove(
				front,
				'bf3428ed-4ee8-4321-8099-6590d0b51fd6',
				'up',
			);

			expect(newIndex).toBe(0);
		});

		it('should not return an index when moving a collection out of bounds upwards', async () => {
			const newIndex = getNewCollectionIndexForMove(
				front,
				'165193d5-3761-466c-af9a-4fc09fd91133',
				'up',
			);

			expect(newIndex).toBe(undefined);
		});

		it('should not return an index when moving a collection out of bounds upwards', async () => {
			const newIndex = getNewCollectionIndexForMove(
				front,
				'bf3428ed-4ee8-4321-8099-6590d0b51fd6',
				'down',
			);

			expect(newIndex).toBe(undefined);
		});
	});
});
