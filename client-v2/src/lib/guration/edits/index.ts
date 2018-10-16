import { Path } from '../utils/path';
import { Overwrite } from 'utility-types';
import { format } from 'util';

interface EditBase<T extends string, P> {
  type: T;
  payload: P;
  meta: any;
}

type Move = EditBase<
  'MOVE',
  {
    type: string;
    id: string;
    from: {
      parent: Path;
    };
    to: {
      parent: Path;
      index: number;
    };
  }
>;

const move = (
  type: string,
  id: string,
  dragPath: Path[],
  path: Path[],
  newIndex: number,
  meta: any = {}
): Move => ({
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

type Insert = EditBase<
  'INSERT',
  {
    type: string;
    id: string;
    path: {
      parent: Path;
      index: number;
    };
  }
>;

const insert = (
  type: string,
  id: string,
  dragPath: Path[],
  newIndex: number,
  meta: any = {}
): Insert => ({
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

type Edit = Move | Insert;

export { Edit, Move, Insert };

export { move, insert };
