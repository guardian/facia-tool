import { createRingBuffer } from '../ringBuffer';

describe('createRingBuffer', () => {
	it('rejects a capacity that cannot hold anything', () => {
		expect(() => createRingBuffer(0)).toThrow();
		expect(() => createRingBuffer(-1)).toThrow();
		expect(() => createRingBuffer(1.5)).toThrow();
	});

	it('drains entries oldest-first', () => {
		const buffer = createRingBuffer<number>(4);
		buffer.push(1);
		buffer.push(2);
		buffer.push(3);

		expect(buffer.size).toBe(3);
		expect(buffer.drain()).toEqual([1, 2, 3]);
	});

	it('empties on drain', () => {
		const buffer = createRingBuffer<number>(4);
		buffer.push(1);
		buffer.drain();

		expect(buffer.size).toBe(0);
		expect(buffer.drain()).toEqual([]);
	});

	it('discards the oldest entries once full, rather than growing', () => {
		const buffer = createRingBuffer<number>(3);
		[1, 2, 3, 4, 5].forEach((n) => buffer.push(n));

		// Capacity is the hard limit: memory stays flat however long the
		// editing session runs.
		expect(buffer.size).toBe(3);
		expect(buffer.discarded).toBe(2);
		expect(buffer.drain()).toEqual([3, 4, 5]);
	});

	it('resets the discarded count on drain', () => {
		const buffer = createRingBuffer<number>(2);
		[1, 2, 3].forEach((n) => buffer.push(n));
		expect(buffer.discarded).toBe(1);

		buffer.drain();
		expect(buffer.discarded).toBe(0);
	});

	it('keeps wrapping correctly across repeated fill and drain cycles', () => {
		const buffer = createRingBuffer<number>(3);

		[1, 2, 3, 4].forEach((n) => buffer.push(n));
		expect(buffer.drain()).toEqual([2, 3, 4]);

		[5, 6].forEach((n) => buffer.push(n));
		expect(buffer.drain()).toEqual([5, 6]);
	});

	it('handles a capacity of one', () => {
		const buffer = createRingBuffer<number>(1);
		buffer.push(1);
		buffer.push(2);

		expect(buffer.size).toBe(1);
		expect(buffer.drain()).toEqual([2]);
	});
});
