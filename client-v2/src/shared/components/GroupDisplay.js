// @flow

import * as React from 'react';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
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
  <>
    {groupName && (
      <GroupContainer>
        <GroupHeading style={{ margin: 0 }}>{groupName}</GroupHeading>
        <HorizontalRule />
      </GroupContainer>
    )}
    {children}
  </>
);

export default GroupDisplayComponent;
