/**
 * Types for the client performance instrumentation.
 *
 * These describe samples gathered *passively* from browser performance
 * observers. Nothing here runs on the drag-and-drop critical path.
 */

/**
 * A single user interaction, as reported by the Event Timing API.
 *
 * The browser records these regardless of whether we observe them, so
 * collecting them costs nothing on the interaction itself.
 */
export interface InteractionSample {
	/** The event that triggered the interaction, e.g. 'drop'. */
	name: string;
	/** When the user released, relative to the time origin. */
	startTime: number;
	/**
	 * Time from the user releasing to the next paint, in ms. This is the
	 * latency the user actually perceives, and is the measurement INP is
	 * built on.
	 */
	duration: number;
	/**
	 * Time spent in synchronous event handlers, in ms. The gap between this
	 * and `duration` is time spent rendering, in layout, or waiting for the
	 * main thread.
	 */
	processingTime: number;
	/**
	 * Delay between the user releasing and handlers starting, in ms. A large
	 * value means the main thread was already busy when the drop happened.
	 */
	inputDelay: number;
}

/** A main-thread long task, as reported by the Long Tasks API. */
export interface LongTaskSample {
	startTime: number;
	duration: number;
}

/**
 * Where samples are delivered. Both handlers are optional so a consumer can
 * subscribe to only what it needs.
 */
export interface MetricsSink {
	onInteraction?: (sample: InteractionSample) => void;
	onLongTask?: (sample: LongTaskSample) => void;
}
