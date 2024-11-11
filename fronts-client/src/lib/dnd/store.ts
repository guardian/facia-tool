import throttle from 'lodash/throttle';

type Key = string | null;
type Index = number | null;

type Sub = (key: Key, index: Index) => void;

interface State {
	key: Key;
	index: Index;
	isDraggedOver: boolean;
}

const createStore = (
	initState: State = { key: null, index: null, isDraggedOver: false },
) => {
	let subs: Sub[] = [];
	let state = initState;
	const notify = throttle(
		() => subs.forEach((sub) => sub(state.key, state.index)),
		100,
		{
			leading: true,
			trailing: true,
		},
	);

	return {
		subscribe: (fn: Sub) => (subs = [...subs, fn]),
		unsubscribe: (fn: Sub) => (subs = subs.filter((c) => c !== fn)),
		update: (key: Key, index: Index, isDraggedOver: boolean) => {
			if (
				key === state.key &&
				index === state.index &&
				isDraggedOver === state.isDraggedOver
			) {
				return;
			}
			state = { key, index, isDraggedOver };
			notify();
		},
		getState: () => state,
	};
};

type Store = ReturnType<typeof createStore>;

export { Store, Sub };

export default createStore;
