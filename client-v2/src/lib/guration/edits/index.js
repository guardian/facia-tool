// @flow

import type { Path } from '../utils/path';

const move = (
  type: string,
  id: string,
  dragPath: Path[],
  path: Path[],
  newIndex: number,
  meta: Object = {}
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

type Move = $Call<typeof move, string, string, Path[], Path[], number>;

const insert = (
  type: string,
  id: string,
  dragPath: Path[],
  newIndex: number,
  meta: Object = {}
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

type Insert = $Call<typeof insert, string, string, Path[], number>;

type Edit = Move | Insert;

export type { Edit, Move, Insert };

export { move, insert };
