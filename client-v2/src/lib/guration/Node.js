// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import DedupeNode from './DedupeNode';
import type { EventType, DuplicateGetter, IndexOffsetGetter } from './types';
import AddPathLevel from './utils/AddPathLevel';
import type { Path } from './utils/path';

const getDropIndexOffset = ({ currentTarget: el, clientY }: EventType) => {
  const { top, height } = el.getBoundingClientRect();
  const y = clientY - top;
  return y > height / 2 ? 1 : 0;
};

type DOMNodeProps = {
  draggable: boolean,
  onDragStart: (e: EventType) => void,
  onDragOver: ?(e: EventType) => void,
  onDrop: ?(e: EventType) => void
};

type NodeProps<T> = {
  item: T,
  id: string,
  externalKey: string,
  type: string,
  childrenField: string,
  index: number,
  register: *,
  deregister: *,
  getDuplicate: *,
  handleDragStart: (
    item: T,
    path: Path[],
    id: string,
    externalKey: string,
    type: string
  ) => (e: EventType) => void,
  handleDragOver:
    | ((
        candidatePath: Path[],
        getDuplicate: DuplicateGetter,
        getIndexOffset: IndexOffsetGetter
      ) => (e: EventType) => void)
    | false,
  handleDrop:
    | ((
        candidatePath: Path[],
        getDuplicate: DuplicateGetter,
        getIndexOffset: IndexOffsetGetter
      ) => (e: EventType) => void)
    | false,
  children: (
    node: T,
    getNodeProps: () => DOMNodeProps,
    index: number
  ) => ReactNode
};

const Node = <T>({
  item,
  id,
  externalKey,
  type,
  childrenField,
  index,
  register,
  deregister,
  getDuplicate,
  handleDragStart,
  handleDragOver,
  handleDrop,
  children
}: NodeProps<T>) => (
  <AddPathLevel id={id} type={type} childrenField={childrenField} index={index}>
    {path => (
      <DedupeNode
        externalKey={externalKey}
        index={index}
        path={path}
        register={register}
        deregister={deregister}
      >
        {children(
          item,
          () => ({
            draggable: true,
            onDragStart: handleDragStart(item, path, id, externalKey, type),
            ...(handleDrop && handleDragOver
              ? {
                  onDrop: handleDrop(path, getDuplicate, getDropIndexOffset),
                  onDragOver: handleDragOver(
                    path,
                    getDuplicate,
                    getDropIndexOffset
                  )
                }
              : {})
          }),
          index
        )}
      </DedupeNode>
    )}
  </AddPathLevel>
);

type NodeChildren<T> = $ElementType<NodeProps<T>, 'children'>;

export type { NodeChildren };

export default Node;
