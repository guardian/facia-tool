import { Notification } from 'bundles/notificationsBundle';

type Subscriber = (notification: Notification) => void;

/**
 * An singleton event bus to decouple parts of the app that need to
 * create notifications from the store.
 *
 * This is necessary because importing the store directly results in
 * circular dependencies.
 */
class NotificationService {
	private subscribers = [] as Subscriber[];

	public subscribe(subscriber: Subscriber) {
		this.subscribers.push(subscriber);
	}

	public unsubscribe(subscriber: Subscriber) {
		this.subscribers = this.subscribers.filter((_) => _ !== subscriber);
	}

	public notify(notification: Notification) {
		this.subscribers.forEach((sub) => sub(notification));
	}
}

export default new NotificationService();
