// @flow

import React, { type Node as ReactNode } from 'react';
import * as Guration from 'guration';
import DropZone from 'components/DropZone';

type ChildrenProps<T> = {
  children: (child: T, i: number) => ReactNode,
  childArray: Array<T>,
  type: string,
  childrenKey: string
};

const Children = <T: { id: string }>({
  children,
  childArray,
  ...props
}: ChildrenProps<T>) => (
  <Guration.Children {...props}>
    {getDropProps => (
      <div style={{ marginLeft: 10 }}>
        {childArray.map((child, i) => (
          <React.Fragment key={child.id}>
            <DropZone {...getDropProps(i)} />
            <div>{children(child, i)}</div>
          </React.Fragment>
        ))}
        <DropZone {...getDropProps(childArray.length)} />
      </div>
    )}
  </Guration.Children>
);

export default Children;
