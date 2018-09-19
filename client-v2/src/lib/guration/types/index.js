// @flow

import type { Path } from '../utils/path';

type ExternalDrag = {|
  dropType: 'EXTERNAL',
  id: string,
  externalKey?: ?string,
  type: string,
  meta?: Object,
  path: void
|};

type InternalDrag = {|
  dropType: 'INTERNAL',
  rootKey: string,
  id: string,
  externalKey: string,
  meta?: Object,
  path: Path[],
  type: string
|};

type Drag = ExternalDrag | InternalDrag;

type EventType = SyntheticDragEvent<HTMLElement>;

type DuplicateGetter = <T>(
  id: string
) => ?{
  index: number,
  path: Path[]
};

type IndexOffsetGetter = ((e: EventType) => number) | number;

export type {
  Drag,
  InternalDrag,
  ExternalDrag,
  EventType,
  DuplicateGetter,
  IndexOffsetGetter
};
