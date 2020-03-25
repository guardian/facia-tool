import {
  reducer,
  initialState,
  actionAddNotificationBanner,
  actionRemoveNotificationBanner,
  selectBannerMessage
} from '../notificationsBundle';
import { state as fixtureState } from 'fixtures/initialState';

describe('Notifications bundle', () => {
  describe('reducer', () => {
    it('should add a notification banner message', () => {
      const state = reducer(initialState, actionAddNotificationBanner('Example message'))
      expect(state.banner?.message).toBe('Example message')
    });
    it('should remove a notification banner message', () => {
      const state = reducer(initialState, actionRemoveNotificationBanner())
      expect(state.banner?.message).toBe(undefined)
    });
  });
  describe('selectors', () => {
    it('should select the current banner message, if there is one', () => {
      const state = reducer(initialState, actionAddNotificationBanner('Example message'))
      const rootState = {
        ...fixtureState,
        notifications: state
      }
      expect(selectBannerMessage(rootState)).toBe('Example message')
    })
  })
});
