import { insertAndDedupeSiblings } from 'util/insertAndDedupeSiblings';

const cardMap = {
	a: {
		uuid: 'a',
		id: '1',
		meta: {},
		frontPublicationDate: 0,
	},
	b: {
		uuid: 'b',
		id: '2',
		meta: {},
		frontPublicationDate: 0,
	},
	c: {
		uuid: 'c',
		id: '3',
		meta: {},
		frontPublicationDate: 0,
	},
	d: {
		uuid: 'd',
		id: '3', // same as c
		meta: {},
		frontPublicationDate: 0,
	},
	e: {
		uuid: 'e',
		id: '2', // same as b
		meta: {},
		frontPublicationDate: 0,
	},
};

describe('insertAndDedupeSiblings', () => {
	it('inserts a card', () => {
		expect(insertAndDedupeSiblings(['a', 'b'], ['c'], 0, cardMap)).toEqual([
			'c',
			'a',
			'b',
		]);

		expect(insertAndDedupeSiblings(['a', 'b'], ['c'], 2, cardMap)).toEqual([
			'a',
			'b',
			'c',
		]);
	});

	it('keeps the latest insertion if the items are the same', () => {
		expect(insertAndDedupeSiblings(['a', 'c'], ['a'], 2, cardMap)).toEqual([
			'c',
			'a',
		]);
	});

	it('keeps the first occurence of existing duplicates and removes the rest', () => {
		expect(insertAndDedupeSiblings(['c', 'd'], ['a'], 0, cardMap)).toEqual([
			'a',
			'c',
		]);
	});

	it('removes duplicates for new insertions', () => {
		expect(insertAndDedupeSiblings(['a', 'd'], ['c'], 2, cardMap)).toEqual([
			'a',
			'c',
		]);
	});

	it('always keeps the recently added duplicate', () => {
		expect(insertAndDedupeSiblings(['a', 'c'], ['d'], 2, cardMap)).toEqual([
			'a',
			'd',
		]);
	});

	it('skips inserts when this dedupe is running as part of an insert elsewhere', () => {
		expect(
			insertAndDedupeSiblings(['a', 'c'], ['b'], 2, cardMap, false),
		).toEqual(['a', 'c']);

		expect(
			insertAndDedupeSiblings(['a', 'c'], ['d'], 2, cardMap, false),
		).toEqual(['a']);
	});

	it('dedupes duplicates at the inserted index in a different group', () => {
		// added for regression around testing which is the newest insertion
		expect(
			insertAndDedupeSiblings(['a', 'c'], ['d'], 1, cardMap, false),
		).toEqual(['a']);
	});

	it('takes multiple insertions and only dedupes existing', () => {
		expect(
			insertAndDedupeSiblings(['a', 'b', 'c'], ['d', 'e'], 1, cardMap),
		).toEqual(['a', 'd', 'e']);
	});

	it('takes multiple insertions with duplicates and keeps the first', () => {
		expect(insertAndDedupeSiblings(['a', 'c'], ['b', 'e'], 1, cardMap)).toEqual(
			['a', 'b', 'c'],
		);
	});
});
