

import { Path } from '../utils/path';

interface ExternalDrag {
  dropType: 'EXTERNAL',
  id: string,
  type: string,
  meta?: object
}

interface InternalDrag {
  dropType: 'INTERNAL',
  rootKey: string,
  id: string,
  meta?: object,
  path: Path[],
  type: string
}

type Drag = ExternalDrag | InternalDrag;

type EventType = React.DragEvent<HTMLElement>;

type IndexOffsetGetter = ((e: EventType) => number) | number;

export { Drag, InternalDrag, ExternalDrag, EventType, IndexOffsetGetter };
