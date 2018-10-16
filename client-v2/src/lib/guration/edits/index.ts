import { Path } from '../utils/path';

const move = (
  type: string,
  id: string,
  dragPath: Path[],
  path: Path[],
  newIndex: number,
  meta: object = {}
) => ({
  type: 'MOVE',
  payload: {
    type,
    id,
    from: {
      parent: dragPath[dragPath.length - 2]
    },
    to: {
      parent: path[path.length - 2],
      index: newIndex
    }
  },
  meta
});

type Move = ReturnType<typeof move>;

const insert = (
  type: string,
  id: string,
  dragPath: Path[],
  newIndex: number,
  meta: object = {}
) => ({
  type: 'INSERT',
  payload: {
    type,
    id,
    path: {
      parent: dragPath[dragPath.length - 2],
      index: newIndex
    }
  },
  meta
});

type Insert = ReturnType<typeof insert>;

type Edit = Move | Insert;

export { Edit, Move, Insert };

export { move, insert };
