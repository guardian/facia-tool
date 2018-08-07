// @flow

import * as React from 'react';
import HorizontalRule from 'components/layout/HorizontalRule';
import styled from 'styled-components';

type GroupDisplayComponentProps = {
  groupName: string,
  children: React.Node
};

const GroupHeading = styled('div')`
  font-size: 14px;
  font-weight: bold;
`;

const GroupContainer = styled('div')`
  margin-top: 20px;
`;

const GroupDisplayComponent = ({
  groupName,
  children
}: GroupDisplayComponentProps) => (
  <GroupContainer>
    {groupName && (
      <>
        <GroupHeading style={{ margin: 0 }}>{groupName}</GroupHeading>
        <HorizontalRule />
      </>
    )}
    {children}
  </GroupContainer>
);

export default GroupDisplayComponent;
