/**
 * Types for the client performance instrumentation.
 *
 * Most of these describe samples gathered *passively* from browser
 * performance observers, which cost nothing on the drag-and-drop critical
 * path. `DropSample` is the exception: it carries context the browser cannot
 * know, so a small amount of our own code runs during a drop to produce it.
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

/** What the user did with the card. */
export type DropOperation =
	/** Repositioned within the same container. */
	| 'reorder'
	/** Moved to a different container. */
	| 'move'
	/** Copied, leaving the original in place. */
	| 'copy'
	/** Added from outside the fronts tree, e.g. the feed or a URL. */
	| 'insert';

/**
 * Context for a single drop, captured by our own code.
 *
 * This exists because Event Timing reports latency but carries no payload: it
 * can tell us a drop took 400ms, but not that it was a reorder into a
 * 30-card container. `startTime` falls within the Event Timing entry's
 * processing window, which is how the two are correlated.
 */
export interface DropSample {
	operation: DropOperation;
	/** Timestamp at entry to the drop handler. */
	startTime: number;
	/** Duration of the synchronous drop handler, in ms. */
	handlerMs: number;
	/** The container being dropped into, where known. */
	collectionId?: string;
	/** How many cards the target container already held. */
	cardCount: number;
}

/**
 * Timings for persisting a collection.
 *
 * Collection saves are debounced, so `queueMs` is mostly expected wait and
 * should not be read as processing time. Keeping it separate from
 * `requestMs` is the point: it stops a slow save being blamed on the network
 * when it was actually sat in the debounce, and vice versa.
 */
export interface SaveSample {
	collectionId: string;
	/** Time from the first pending edit to the request starting, in ms. */
	queueMs: number;
	/** Duration of the save request itself, in ms. */
	requestMs: number;
	ok: boolean;
}

/**
 * Where samples are delivered. All handlers are optional so a consumer can
 * subscribe to only what it needs.
 */
export interface MetricsSink {
	onInteraction?: (sample: InteractionSample) => void;
	onLongTask?: (sample: LongTaskSample) => void;
	onDrop?: (sample: DropSample) => void;
	onSave?: (sample: SaveSample) => void;
}
