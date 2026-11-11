/**
 * A fixed-capacity buffer that overwrites its oldest entry when full.
 *
 * Used to hold performance samples. A plain array would grow without bound
 * during a long editing session; this keeps memory flat and makes `push` a
 * constant-time write into a pre-allocated slot, with no allocation and no
 * resizing. That matters because pushes can happen while the user is
 * interacting, and the instrumentation must not add to the lag it measures.
 */
export interface RingBuffer<T> {
	/** Overwrites the oldest entry once capacity is reached. */
	push: (item: T) => void;
	/** Returns buffered entries oldest-first and empties the buffer. */
	drain: () => T[];
	/** Number of entries currently buffered. */
	readonly size: number;
	/**
	 * How many entries have been discarded by overwriting since the last
	 * drain. Non-zero means we are sampling faster than we are draining.
	 */
	readonly discarded: number;
}

export const createRingBuffer = <T>(capacity: number): RingBuffer<T> => {
	if (!Number.isInteger(capacity) || capacity < 1) {
		throw new Error(
			`RingBuffer capacity must be a positive integer, got ${capacity}`,
		);
	}

	// Pre-allocated so that `push` never triggers a resize.
	const slots: Array<T | undefined> = new Array(capacity);
	let writeIndex = 0;
	let size = 0;
	let discarded = 0;

	return {
		push: (item: T) => {
			if (size === capacity) {
				discarded++;
			} else {
				size++;
			}
			slots[writeIndex] = item;
			writeIndex = (writeIndex + 1) % capacity;
		},

		drain: () => {
			const items: T[] = [];
			// The oldest entry is `size` slots behind the write cursor.
			const start = (writeIndex - size + capacity) % capacity;
			for (let i = 0; i < size; i++) {
				const item = slots[(start + i) % capacity];
				if (item !== undefined) {
					items.push(item);
				}
			}
			slots.fill(undefined);
			writeIndex = 0;
			size = 0;
			discarded = 0;
			return items;
		},

		get size() {
			return size;
		},

		get discarded() {
			return discarded;
		},
	};
};
