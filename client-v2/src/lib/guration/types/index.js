// @flow

import type { Path } from '../utils/path';

type ExternalDrag = {|
  dropType: 'EXTERNAL',
  id: string,
  type: string,
  meta?: Object
|};

type InternalDrag = {|
  dropType: 'INTERNAL',
  rootKey: string,
  id: string,
  meta?: Object,
  path: Path[],
  type: string
|};

type Drag = ExternalDrag | InternalDrag;

type EventType = SyntheticDragEvent<HTMLElement>;

type IndexOffsetGetter = ((e: EventType) => number) | number;

export type { Drag, InternalDrag, ExternalDrag, EventType, IndexOffsetGetter };
