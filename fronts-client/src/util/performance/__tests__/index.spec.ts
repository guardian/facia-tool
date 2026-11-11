interface FakeObserverInstance {
	callback: PerformanceObserverCallback;
	init?: PerformanceObserverInit;
	disconnected: boolean;
}

const originalPerformanceObserver = (global as any).PerformanceObserver;

const installFakeObserver = (supportedEntryTypes: string[]) => {
	const instances: FakeObserverInstance[] = [];

	class FakePerformanceObserver {
		public static supportedEntryTypes = supportedEntryTypes;
		private instance: FakeObserverInstance;

		constructor(callback: PerformanceObserverCallback) {
			this.instance = { callback, disconnected: false };
			instances.push(this.instance);
		}

		public observe(init: PerformanceObserverInit) {
			this.instance.init = init;
		}

		public disconnect() {
			this.instance.disconnected = true;
		}
	}

	(global as any).PerformanceObserver = FakePerformanceObserver;

	const emitTo = (type: string, entries: unknown[]) =>
		instances
			.filter((instance) => instance.init?.type === type)
			.forEach((instance) =>
				instance.callback(
					{ getEntries: () => entries } as PerformanceObserverEntryList,
					{} as PerformanceObserver,
				),
			);

	return {
		instances,
		emitDrop: (overrides: Record<string, unknown> = {}) =>
			emitTo('event', [
				{
					name: 'drop',
					startTime: 1000,
					duration: 300,
					processingStart: 1010,
					processingEnd: 1100,
					...overrides,
				},
			]),
		emitLongTask: (duration: number) =>
			emitTo('longtask', [{ startTime: 1000, duration }]),
	};
};

// The module holds buffers in module scope, so each test needs a fresh copy.
const loadModule = () => require('../index') as typeof import('../index');

beforeEach(() => {
	jest.resetModules();
});

afterEach(() => {
	(global as any).PerformanceObserver = originalPerformanceObserver;
});

describe('startPassiveObservers', () => {
	it('reports false when the browser supports neither API', () => {
		installFakeObserver([]);
		const metrics = loadModule();

		expect(metrics.startPassiveObservers()).toBe(false);
	});

	it('reports true when at least one observer starts', () => {
		installFakeObserver(['event']);
		const metrics = loadModule();

		expect(metrics.startPassiveObservers()).toBe(true);
	});

	it('does not start a second set of observers when called again', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();

		metrics.startPassiveObservers();
		metrics.startPassiveObservers();

		expect(fake.instances).toHaveLength(2);
	});

	it('disconnects every observer when stopped', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();

		metrics.startPassiveObservers();
		metrics.stopPassiveObservers();

		expect(fake.instances.every((i) => i.disconnected)).toBe(true);
	});
});

describe('drainSamples', () => {
	it('returns nothing before any samples arrive', () => {
		installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();
		metrics.startPassiveObservers();

		expect(metrics.drainSamples()).toEqual({
			interactions: [],
			longTasks: [],
			discarded: 0,
		});
	});

	it('buffers interactions and long tasks separately', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();
		metrics.startPassiveObservers();

		fake.emitDrop();
		fake.emitLongTask(120);

		const drained = metrics.drainSamples();
		expect(drained.interactions).toEqual([
			{
				name: 'drop',
				startTime: 1000,
				duration: 300,
				processingTime: 90,
				inputDelay: 10,
			},
		]);
		expect(drained.longTasks).toEqual([{ startTime: 1000, duration: 120 }]);
	});

	it('empties the buffers so samples are not reported twice', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();
		metrics.startPassiveObservers();

		fake.emitDrop();
		metrics.drainSamples();

		expect(metrics.drainSamples().interactions).toEqual([]);
	});
});

describe('subscribeToMetrics', () => {
	it('delivers samples to subscribers as they arrive', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();
		const onInteraction = jest.fn();
		const onLongTask = jest.fn();

		metrics.subscribeToMetrics({ onInteraction, onLongTask });
		metrics.startPassiveObservers();

		fake.emitDrop();
		fake.emitLongTask(80);

		expect(onInteraction).toHaveBeenCalledTimes(1);
		expect(onLongTask).toHaveBeenCalledTimes(1);
	});

	it('stops delivering once unsubscribed', () => {
		const fake = installFakeObserver(['event']);
		const metrics = loadModule();
		const onInteraction = jest.fn();

		const unsubscribe = metrics.subscribeToMetrics({ onInteraction });
		metrics.startPassiveObservers();
		unsubscribe();

		fake.emitDrop();

		expect(onInteraction).not.toHaveBeenCalled();
	});

	it('tolerates a subscriber that only wants one kind of sample', () => {
		const fake = installFakeObserver(['event', 'longtask']);
		const metrics = loadModule();
		const onLongTask = jest.fn();

		metrics.subscribeToMetrics({ onLongTask });
		metrics.startPassiveObservers();

		expect(() => fake.emitDrop()).not.toThrow();
		expect(onLongTask).not.toHaveBeenCalled();
	});

	it('keeps collecting when a subscriber throws', () => {
		const fake = installFakeObserver(['event']);
		const metrics = loadModule();
		const healthy = jest.fn();

		metrics.subscribeToMetrics({
			onInteraction: () => {
				throw new Error('subscriber blew up');
			},
		});
		metrics.subscribeToMetrics({ onInteraction: healthy });
		metrics.startPassiveObservers();

		expect(() => fake.emitDrop()).not.toThrow();
		// A faulty subscriber must not cost us the sample, or starve others.
		expect(healthy).toHaveBeenCalledTimes(1);
		expect(metrics.drainSamples().interactions).toHaveLength(1);
	});
});
