import { InteractionSample, LongTaskSample } from './types';

/**
 * `durationThreshold` is not yet in TypeScript's DOM lib.
 *
 * The Event Timing spec clamps anything below 16ms up to 16ms, so 16 is the
 * most granular useful value.
 */
interface EventTimingObserverInit extends PerformanceObserverInit {
	durationThreshold?: number;
}

const DURATION_THRESHOLD_MS = 16;

/**
 * Drag events we care about. Event Timing reports many event types; we only
 * want the ones that bracket a card being dropped onto a container.
 */
const OBSERVED_EVENTS = ['drop', 'dragend'];

type Stop = () => void;

const isObserverSupported = (): boolean =>
	typeof PerformanceObserver === 'function';

/**
 * Whether the browser can report a given entry type. Checking up front means
 * an unsupported type is a no-op rather than a thrown error.
 */
const supportsEntryType = (type: string): boolean => {
	const supported = (
		PerformanceObserver as unknown as { supportedEntryTypes?: string[] }
	).supportedEntryTypes;
	// If the browser doesn't expose the list we optimistically try to observe,
	// and rely on the try/catch below.
	return !supported || supported.includes(type);
};

/**
 * Observe interaction latency via the Event Timing API.
 *
 * This is the cheapest possible way to measure drop latency: the browser
 * records these entries whether or not we listen, so no instrumentation runs
 * inside the drop handler itself. `duration` covers the time from the user
 * releasing the card to the next paint, which is the latency they perceive.
 *
 * Returns a function to stop observing, or null if unsupported.
 */
export const startEventTimingObserver = (
	onSample: (sample: InteractionSample) => void,
): Stop | null => {
	if (!isObserverSupported() || !supportsEntryType('event')) {
		return null;
	}

	try {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!OBSERVED_EVENTS.includes(entry.name)) {
					continue;
				}
				const timing = entry as PerformanceEventTiming;
				onSample({
					name: timing.name,
					startTime: timing.startTime,
					duration: timing.duration,
					processingTime: timing.processingEnd - timing.processingStart,
					inputDelay: timing.processingStart - timing.startTime,
				});
			}
		});

		observer.observe({
			type: 'event',
			durationThreshold: DURATION_THRESHOLD_MS,
			buffered: true,
		} as EventTimingObserverInit);

		return () => observer.disconnect();
	} catch {
		// An unsupported entry type throws. Degrade to collecting nothing.
		return null;
	}
};

/**
 * Observe main-thread long tasks.
 *
 * Long tasks overlapping a slow drop tell us the main thread was blocked,
 * which distinguishes "our drop handler is slow" from "something else was
 * occupying the thread when the drop happened".
 *
 * Returns a function to stop observing, or null if unsupported.
 */
export const startLongTaskObserver = (
	onSample: (sample: LongTaskSample) => void,
): Stop | null => {
	if (!isObserverSupported() || !supportsEntryType('longtask')) {
		return null;
	}

	try {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				onSample({
					startTime: entry.startTime,
					duration: entry.duration,
				});
			}
		});

		observer.observe({ type: 'longtask', buffered: true });

		return () => observer.disconnect();
	} catch {
		return null;
	}
};
