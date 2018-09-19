// @flow

import { createContext } from 'react';
import type { EventType, DuplicateGetter, IndexOffsetGetter } from './types';
import type { Path } from './utils/path';

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
    getDuplicate: DuplicateGetter,
    getIndexOffset: IndexOffsetGetter
  ) => (e: EventType) => {
    throw new Error('Cannot handle dragover outside of Guration.Root');
  },
  handleDrop: (
    candidatePath: Path[],
    getDuplicate: DuplicateGetter,
    getIndexOffset: IndexOffsetGetter
  ) => (e: EventType) => {
    throw new Error('Cannot handle drop outside of Guration.Root');
  },
  dropInfo: { canDrop: (null: ?boolean), path: (null: ?(Path[])) }
});

type DedupeContextType = {
  [string]: {|
    register: (dedupeKey: string, index: number, path: Path[]) => void,
    deregister: (dedupeKey: string) => void,
    getDuplicate: (key: string) => Object
  |}
};

const DedupeContext = createContext(({}: DedupeContextType));

export { PathContext, RootContext, DedupeContext };
export type { DuplicateGetter, DedupeContextType };
