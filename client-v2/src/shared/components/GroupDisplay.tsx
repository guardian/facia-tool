import React from 'react';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import { styled } from 'shared/constants/theme';

interface GroupDisplayComponentProps {
  groupName: string | null;
}

const GroupHeading = styled('div')`
  font-size: 14px;
  font-weight: bold;
`;

const GroupContainer = styled('div')`
  margin-top: 20px;
`;

const GroupDisplayComponent = ({ groupName }: GroupDisplayComponentProps) =>
  groupName ? (
    <GroupContainer data-testid={groupName}>
      <GroupHeading style={{ margin: 0 }}>{groupName}</GroupHeading>
      <HorizontalRule />
    </GroupContainer>
  ) : null;

export default GroupDisplayComponent;
