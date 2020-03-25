import {
  reducer,
  initialState,
  actionAddNotificationBanner,
  actionRemoveNotificationBanner,
  selectBanners
} from '../notificationsBundle';
import { state as fixtureState } from 'fixtures/initialState';

describe('Notifications bundle', () => {
  describe('reducer', () => {
    it('should add a notification banner message', () => {
      const state = reducer(
        initialState,
        actionAddNotificationBanner('Example message')
      );
      expect(state.banners[0].message).toBe('Example message');
    });

    it('should find duplicate messages and bump the duplicate count rather than display a new notification', () => {
      const state = reducer(
        initialState,
        actionAddNotificationBanner('Example message')
      );
      const newState = reducer(
        state,
        actionAddNotificationBanner('Example message')
      );
      expect(newState.banners.length).toBe(1);
      expect(newState.banners[0].duplicates).toBe(2);
    });

    it('should remove a notification banner message', () => {
      const state = reducer(
        initialState,
        actionAddNotificationBanner('Example message')
      );
      const newState = reducer(
        initialState,
        actionRemoveNotificationBanner(state.banners[0].id)
      );
      expect(newState.banners).toEqual([]);
    });
  });

  describe('selectors', () => {
    it('should select the current banners', () => {
      const state = reducer(
        initialState,
        actionAddNotificationBanner('Example message')
      );
      const rootState = {
        ...fixtureState,
        notifications: state
      };
      expect(selectBanners(rootState)).toEqual(state.banners);
    });
  });
});
