import { Action } from 'types/Action';
import set from 'lodash/fp/set';
import { State } from 'types/State';

interface BannerNotification {
  message: string;
}

export interface NotificationState {
  banner: BannerNotification | undefined;
}

// Actions

export const NOTIFICATION_ADD_BANNER = 'NOTIFICATION_ADD_BANNER' as const;

export const actionAddNotificationBanner = (message: string) => ({
  type: NOTIFICATION_ADD_BANNER,
  payload: { message }
});

export const NOTIFICATION_REMOVE_BANNER = 'NOTIFICATION_REMOVE_BANNER' as const;

export const actionRemoveNotificationBanner = () => ({
  type: NOTIFICATION_REMOVE_BANNER
});

export type NotificationActions =
  | ReturnType<typeof actionAddNotificationBanner>
  | ReturnType<typeof actionRemoveNotificationBanner>;

// Selectors

export const selectBannerMessage = (state: State) => state.notifications.banner?.message;

// Reducer

export const initialState: NotificationState = { banner: undefined };

export const reducer = (state: NotificationState = initialState, action: Action): NotificationState => {
  switch (action.type) {
    case NOTIFICATION_ADD_BANNER: {
      return set(['banner', 'message'], action.payload.message, state);
    }
    case NOTIFICATION_REMOVE_BANNER: {
      return set(['banner'], undefined, state);
    }
  }
  return state;
};
