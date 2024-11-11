import type { Action } from 'types/Action';
import type { State } from 'types/State';
import v4 from 'uuid/v4';

type NotificationLevels = 'error';

export interface Notification {
	message: string;
	level: NotificationLevels;
	dismissalCallback?: () => void;
}

interface InternalBannerNotification extends Notification {
	id: string;
	duplicates: number;
}

export interface NotificationState {
	banners: InternalBannerNotification[];
}

// Actions

export const NOTIFICATION_ADD_BANNER = 'NOTIFICATION_ADD_BANNER' as const;

export const actionAddNotificationBanner = (notification: Notification) => ({
	type: NOTIFICATION_ADD_BANNER,
	payload: { ...notification, id: v4() },
});

export const NOTIFICATION_REMOVE_BANNER = 'NOTIFICATION_REMOVE_BANNER' as const;

export const actionRemoveNotificationBanner = (id: string) => ({
	type: NOTIFICATION_REMOVE_BANNER,
	payload: { id },
});

export type NotificationActions =
	| ReturnType<typeof actionAddNotificationBanner>
	| ReturnType<typeof actionRemoveNotificationBanner>;

// Selectors

export const selectBanners = (state: State) => state.notifications.banners;

// Reducer

export const initialState: NotificationState = {
	banners: [],
};

export const reducer = (
	state: NotificationState = initialState,
	action: Action,
): NotificationState => {
	switch (action.type) {
		case NOTIFICATION_ADD_BANNER: {
			const duplicateNotification = state.banners.find(
				(_) => _.message === action.payload.message,
			);
			if (duplicateNotification) {
				return {
					banners: [
						...state.banners.filter((_) => _.id !== duplicateNotification.id),
						{
							...duplicateNotification,
							duplicates: duplicateNotification.duplicates + 1,
						},
					],
				};
			}

			return {
				banners: [
					...state.banners,
					{
						...action.payload,
						duplicates: 0,
					},
				],
			};
		}

		case NOTIFICATION_REMOVE_BANNER: {
			return {
				banners: state.banners.filter((_) => _.id !== action.payload.id),
			};
		}
	}
	return state;
};
