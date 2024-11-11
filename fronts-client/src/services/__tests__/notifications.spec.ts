import notifications from 'services/notifications';

describe('Notifications service', () => {
	it('should accept subscriptions and notify them when events are received', () => {
		const notification = { level: 'error' as const, message: 'message' };
		const subscriber = jest.fn();
		notifications.subscribe(subscriber);
		notifications.notify(notification);
		expect(subscriber.mock.calls[0][0]).toEqual(notification);
	});

	it('should allow subscribed services to unsubscribe', () => {
		const notification = { level: 'error' as const, message: 'message' };
		const subscriber = jest.fn();
		notifications.subscribe(subscriber);
		notifications.unsubscribe(subscriber);
		notifications.notify(notification);
		expect(subscriber.mock.calls[0]).toEqual(undefined);
	});
});
