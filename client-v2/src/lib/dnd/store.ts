type Key = string | null;
type Index = number | null;

type Sub = (key: Key, index: Index) => void;

interface State {
  key: Key;
  index: Index;
  isDraggedOver: boolean;
}

const createStore = (
  initState: State = { key: null, index: null, isDraggedOver: false }
) => {
  let subs: Sub[] = [];
  let state = initState;

  return {
    subscribe: (fn: Sub) => (subs = [...subs, fn]),
    unsubscribe: (fn: Sub) => (subs = subs.filter(c => c !== fn)),
    update: (key: Key, index: Index, isDraggedOver: boolean) => {
      state = { key, index, isDraggedOver };
      subs.forEach(sub => sub(key, index));
    },
    getState: () => state
  };
};

type Store = ReturnType<typeof createStore>;

export { Store, Sub };

export default createStore;
