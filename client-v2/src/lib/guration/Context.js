

import { createContext } from 'react';
import { EventType, IndexOffsetGetter } from './types';
import { Path } from './utils/path';

/* eslint-disable no-unused-vars */

const PathContext = createContext([]);
const RootContext = createContext({
  handleDragStart: (item: *, path: Path[], id: string, type: string) => (
    e: EventType
  ) => {
    throw new Error('Cannot handle dragstart outside of Guration.Root');
  },
  handleDragOver: (
    candidatePath: Path[],
    getIndexOffset: IndexOffsetGetter
  ) => (e: EventType) => {
    throw new Error('Cannot handle dragover outside of Guration.Root');
  },
  handleDrop: (candidatePath: Path[], getIndexOffset: IndexOffsetGetter) => (
    e: EventType
  ) => {
    throw new Error('Cannot handle drop outside of Guration.Root');
  },
  dropInfo: { canDrop: (null: ?boolean), path: (null: ?(Path[])) }
});

export { PathContext, RootContext };
