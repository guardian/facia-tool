// @flow

import * as React from 'react';

type GroupDisplayComponentProps = {
  groupName: string,
  children: React.Node
};

const GroupDisplayComponent = ({
  groupName,
  children
}: GroupDisplayComponentProps) => (
  <div>
    <h3 style={{ margin: 0 }}>{groupName}</h3>
    {children}
  </div>
);

export default GroupDisplayComponent;
