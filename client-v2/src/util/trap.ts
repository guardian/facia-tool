import Mousetrap from 'mousetrap';

interface TrapMap {
  [key: string]: (e: KeyboardEvent) => void;
}

const trap = (map: TrapMap) => {
  const entries = Object.entries(map);
  entries.forEach(([seq, handler]) => Mousetrap.bind(seq, handler));
  return () => entries.forEach(([seq]) => Mousetrap.unbind(seq));
};

export { trap };
