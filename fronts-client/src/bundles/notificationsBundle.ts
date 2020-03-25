import { Action } from 'types/Action';
import v4 from 'uuid/v4';

import { State } from 'types/State';

interface BannerNotification {
  id: string;
  message: string;
}

export interface NotificationState {
  banners: BannerNotification[];
}

// Actions

export const NOTIFICATION_ADD_BANNER = 'NOTIFICATION_ADD_BANNER' as const;

export const actionAddNotificationBanner = (message: string) => ({
  type: NOTIFICATION_ADD_BANNER,
  payload: { message, id: v4() }
});

export const NOTIFICATION_REMOVE_BANNER = 'NOTIFICATION_REMOVE_BANNER' as const;

export const actionRemoveNotificationBanner = (id: string) => ({
  type: NOTIFICATION_REMOVE_BANNER,
  payload: { id }
});

export type NotificationActions =
  | ReturnType<typeof actionAddNotificationBanner>
  | ReturnType<typeof actionRemoveNotificationBanner>;

// Selectors

export const selectBanners = (state: State) => state.notifications.banners;

// Reducer

export const initialState: NotificationState = { banners: [] };

export const reducer = (
  state: NotificationState = initialState,
  action: Action
): NotificationState => {
  switch (action.type) {
    case NOTIFICATION_ADD_BANNER: {
      return {
        banners: [
          ...state.banners,
          { id: action.payload.id, message: action.payload.message }
        ]
      };
    }
    case NOTIFICATION_REMOVE_BANNER: {
      return { banners: state.banners.filter(_ => _.id !== action.payload.id) };
    }
  }
  return state;
};
