import createStore from '../store';

describe('store', () => {
	it('has an initial state of null', () => {
		const store = createStore();
		expect(store.getState()).toEqual({
			key: null,
			index: null,
			isDraggedOver: false,
		});
	});

	it('updates the state with `update`', () => {
		const store = createStore();
		store.update('a', 1, false);
		expect(store.getState()).toEqual({
			key: 'a',
			index: 1,
			isDraggedOver: false,
		});
	});

	it('sends updates to listeners', () => {
		const store = createStore();

		let key: string | null = null;
		let index: number | null = null;

		const fn = (k: string | null, i: number | null) => {
			key = k;
			index = i;
		};

		store.subscribe(fn);
		store.update('a', 1, false);
		expect([key, index]).toEqual(['a', 1]);
	});

	it('removes listeners', () => {
		const store = createStore();

		let key: string | null = 'b';
		let index: number | null = 2;

		const fn = (k: string | null, i: number | null) => {
			key = k;
			index = i;
		};

		store.subscribe(fn);
		store.unsubscribe(fn);
		store.update('a', 1, false);
		expect([key, index]).toEqual(['b', 2]);
	});
});
