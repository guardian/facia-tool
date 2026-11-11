/**
 * Passive collection of browser performance samples.
 *
 * This module is deliberately *passive*: it adds no code to the drag-and-drop
 * critical path. Everything here is derived from entries the browser records
 * anyway, delivered asynchronously via PerformanceObserver after paint.
 *
 * Collection is off until `startPassiveObservers` is called.
 */
import { startEventTimingObserver, startLongTaskObserver } from './observers';
import { createRingBuffer } from './ringBuffer';
import { notifySinks } from './sinks';
import { InteractionSample, LongTaskSample } from './types';

/**
 * The feature switch gating all client performance instrumentation. Defined
 * server-side in `app/model/FeatureSwitches.scala`.
 */
export const PERFORMANCE_FEATURE_SWITCH_KEY = 'client-performance-metrics';

/**
 * Bounded so that a long editing session with no consumer draining samples
 * cannot grow memory. Oldest samples are discarded first.
 */
const INTERACTION_BUFFER_SIZE = 64;
const LONG_TASK_BUFFER_SIZE = 64;

const interactions = createRingBuffer<InteractionSample>(
	INTERACTION_BUFFER_SIZE,
);
const longTasks = createRingBuffer<LongTaskSample>(LONG_TASK_BUFFER_SIZE);

let stopObservers: Array<() => void> = [];

/**
 * Notifying subscribers must never break collection, so a throwing subscriber
 * is isolated rather than allowed to propagate into the observer callback.
 */

/**
 * Begin collecting. Safe to call more than once; subsequent calls are ignored
 * while already running.
 *
 * Returns true if at least one observer was started. False means the browser
 * supports neither API, and no data will be collected.
 */
export const startPassiveObservers = (): boolean => {
	if (stopObservers.length) {
		return true;
	}

	const stopEventTiming = startEventTimingObserver((sample) => {
		interactions.push(sample);
		notifySinks(sample, (sink) => sink.onInteraction);
	});

	const stopLongTasks = startLongTaskObserver((sample) => {
		longTasks.push(sample);
		notifySinks(sample, (sink) => sink.onLongTask);
	});

	stopObservers = [stopEventTiming, stopLongTasks].filter(
		(stop): stop is () => void => stop !== null,
	);

	return stopObservers.length > 0;
};

/** Stop collecting and disconnect the observers. */
export const stopPassiveObservers = (): void => {
	stopObservers.forEach((stop) => stop());
	stopObservers = [];
};

export interface DrainedSamples {
	interactions: InteractionSample[];
	longTasks: LongTaskSample[];
	/** Samples lost to buffer overwrite since the last drain. */
	discarded: number;
}

/**
 * Take everything buffered so far, emptying the buffers.
 */
export const drainSamples = (): DrainedSamples => {
	const discarded = interactions.discarded + longTasks.discarded;
	return {
		interactions: interactions.drain(),
		longTasks: longTasks.drain(),
		discarded,
	};
};

export { subscribeToMetrics } from './sinks';
export {
	beginCollectionSave,
	beginDrop,
	endCollectionSave,
	endDrop,
	isPhaseTimingEnabled,
	markCollectionEditQueued,
	setPhaseTimingEnabled,
} from './phaseTimings';
export type {
	DropOperation,
	DropSample,
	InteractionSample,
	LongTaskSample,
	MetricsSink,
	SaveSample,
} from './types';
