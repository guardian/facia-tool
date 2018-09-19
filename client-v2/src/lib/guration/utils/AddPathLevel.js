// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import { PathContext } from '../Context';
import type { Path } from './path';

const addChildrenFieldToParent = (
  path: Path[],
  childrenField: string,
  type: string,
  id: string,
  index: number
): Path[] => {
  const parent = path[path.length - 1];
  return [
    ...path.slice(0, path.length - 1),
    ...(parent
      ? [
          {
            ...parent,
            childrenField
          }
        ]
      : []),
    { type, id, index }
  ];
};

type AddPathLevelProps = {
  type: string,
  id: string,
  index: number,
  childrenField: string,
  children: (newPath: Path[]) => ReactNode
};

const AddPathLevel = ({
  type,
  id,
  index,
  childrenField,
  children
}: AddPathLevelProps) => (
  <PathContext.Consumer>
    {path => {
      const newPath = addChildrenFieldToParent(
        path,
        childrenField,
        type,
        id,
        index
      );
      return (
        <PathContext.Provider value={newPath}>
          {children(newPath)}
        </PathContext.Provider>
      );
    }}
  </PathContext.Consumer>
);

export default AddPathLevel;
