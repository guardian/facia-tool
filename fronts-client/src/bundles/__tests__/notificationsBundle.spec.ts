import {
	reducer,
	initialState,
	actionAddNotificationBanner,
	actionRemoveNotificationBanner,
	selectBanners,
} from '../notificationsBundle';
import { state as fixtureState } from 'fixtures/initialState';

describe('Notifications bundle', () => {
	describe('reducer', () => {
		it('should add a notification banner message', () => {
			const state = reducer(
				initialState,
				actionAddNotificationBanner({
					message: 'Example message',
					level: 'error',
				}),
			);
			expect(state.banners[0].message).toEqual('Example message');
		});

		it('should find duplicate messages and bump the duplicate count rather than display a new notification', () => {
			const state = reducer(
				initialState,
				actionAddNotificationBanner({
					message: 'Example message',
					level: 'error',
				}),
			);
			const newState = reducer(
				state,
				actionAddNotificationBanner({
					message: 'Example message',
					level: 'error',
				}),
			);
			expect(newState.banners.length).toBe(1);
			expect(newState.banners[0].duplicates).toBe(1);
		});

		it('should remove a notification banner message', () => {
			const state = reducer(
				initialState,
				actionAddNotificationBanner({
					message: 'Example message',
					level: 'error',
				}),
			);
			const newState = reducer(
				initialState,
				actionRemoveNotificationBanner(state.banners[0].id),
			);
			expect(newState.banners).toEqual([]);
		});
	});

	describe('selectors', () => {
		it('should select the current banners', () => {
			const state = reducer(
				initialState,
				actionAddNotificationBanner({
					message: 'Example message',
					level: 'error',
				}),
			);
			const rootState = {
				...fixtureState,
				notifications: state,
			};
			expect(selectBanners(rootState)).toEqual(state.banners);
		});
	});
});
