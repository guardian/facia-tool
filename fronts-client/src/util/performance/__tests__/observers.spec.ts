import { startEventTimingObserver, startLongTaskObserver } from '../observers';

interface FakeObserverInstance {
	callback: PerformanceObserverCallback;
	init?: PerformanceObserverInit;
	disconnected: boolean;
}

const originalPerformanceObserver = (global as any).PerformanceObserver;

/**
 * jsdom implements neither Event Timing nor Long Tasks, so we stand in a fake
 * PerformanceObserver and drive its callback by hand.
 */
const installFakeObserver = ({
	supportedEntryTypes,
	throwOnObserve = false,
}: {
	supportedEntryTypes?: string[];
	throwOnObserve?: boolean;
} = {}) => {
	const instances: FakeObserverInstance[] = [];

	class FakePerformanceObserver {
		public static supportedEntryTypes = supportedEntryTypes;
		private instance: FakeObserverInstance;

		constructor(callback: PerformanceObserverCallback) {
			this.instance = { callback, disconnected: false };
			instances.push(this.instance);
		}

		public observe(init: PerformanceObserverInit) {
			if (throwOnObserve) {
				throw new TypeError('Unsupported entry type');
			}
			this.instance.init = init;
		}

		public disconnect() {
			this.instance.disconnected = true;
		}
	}

	if (supportedEntryTypes === undefined) {
		delete (FakePerformanceObserver as any).supportedEntryTypes;
	}

	(global as any).PerformanceObserver = FakePerformanceObserver;

	return {
		instances,
		emit: (entries: unknown[]) =>
			instances.forEach((instance) =>
				instance.callback(
					{ getEntries: () => entries } as PerformanceObserverEntryList,
					{} as PerformanceObserver,
				),
			),
	};
};

const eventEntry = (overrides: Partial<PerformanceEventTiming> = {}) =>
	({
		name: 'drop',
		startTime: 1000,
		duration: 320,
		processingStart: 1010,
		processingEnd: 1180,
		...overrides,
	}) as PerformanceEventTiming;

afterEach(() => {
	(global as any).PerformanceObserver = originalPerformanceObserver;
});

describe('startEventTimingObserver', () => {
	it('returns null when PerformanceObserver is unavailable', () => {
		delete (global as any).PerformanceObserver;

		expect(startEventTimingObserver(jest.fn())).toBeNull();
	});

	it('returns null when the browser cannot report event timing', () => {
		installFakeObserver({ supportedEntryTypes: ['longtask'] });

		expect(startEventTimingObserver(jest.fn())).toBeNull();
	});

	it('returns null rather than throwing when observe is rejected', () => {
		installFakeObserver({
			supportedEntryTypes: ['event'],
			throwOnObserve: true,
		});

		expect(startEventTimingObserver(jest.fn())).toBeNull();
	});

	it('attempts to observe when the supported list is not exposed', () => {
		const fake = installFakeObserver();

		expect(startEventTimingObserver(jest.fn())).not.toBeNull();
		expect(fake.instances[0].init).toMatchObject({ type: 'event' });
	});

	it('observes buffered event timing at the finest useful threshold', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['event'] });

		startEventTimingObserver(jest.fn());

		// 16ms is the spec minimum; anything lower is clamped up to it.
		expect(fake.instances[0].init).toEqual({
			type: 'event',
			durationThreshold: 16,
			buffered: true,
		});
	});

	it('derives processing time and input delay from the entry', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['event'] });
		const onSample = jest.fn();
		startEventTimingObserver(onSample);

		fake.emit([eventEntry()]);

		expect(onSample).toHaveBeenCalledWith({
			name: 'drop',
			startTime: 1000,
			duration: 320,
			processingTime: 170,
			inputDelay: 10,
		});
	});

	it('ignores events unrelated to dropping a card', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['event'] });
		const onSample = jest.fn();
		startEventTimingObserver(onSample);

		fake.emit([
			eventEntry({ name: 'keydown' }),
			eventEntry({ name: 'pointermove' }),
			eventEntry({ name: 'dragend' }),
		]);

		expect(onSample).toHaveBeenCalledTimes(1);
		expect(onSample).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'dragend' }),
		);
	});

	it('disconnects when stopped', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['event'] });

		const stop = startEventTimingObserver(jest.fn());
		stop!();

		expect(fake.instances[0].disconnected).toBe(true);
	});
});

describe('startLongTaskObserver', () => {
	it('returns null when the browser cannot report long tasks', () => {
		installFakeObserver({ supportedEntryTypes: ['event'] });

		expect(startLongTaskObserver(jest.fn())).toBeNull();
	});

	it('observes buffered long tasks', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['longtask'] });

		startLongTaskObserver(jest.fn());

		expect(fake.instances[0].init).toEqual({
			type: 'longtask',
			buffered: true,
		});
	});

	it('reports when the task started and how long it blocked for', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['longtask'] });
		const onSample = jest.fn();
		startLongTaskObserver(onSample);

		fake.emit([{ startTime: 500, duration: 120 } as PerformanceEntry]);

		expect(onSample).toHaveBeenCalledWith({ startTime: 500, duration: 120 });
	});

	it('disconnects when stopped', () => {
		const fake = installFakeObserver({ supportedEntryTypes: ['longtask'] });

		const stop = startLongTaskObserver(jest.fn());
		stop!();

		expect(fake.instances[0].disconnected).toBe(true);
	});
});
