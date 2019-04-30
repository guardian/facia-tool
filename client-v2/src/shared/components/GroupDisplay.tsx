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

const GroupDisplayComponent = ({ groupName }: GroupDisplayComponentProps) =>
  groupName ? (
    <div data-testid={groupName}>
      <GroupHeading style={{ margin: 0 }}>{groupName}</GroupHeading>
      <HorizontalRule />
    </div>
  ) : null;

export default GroupDisplayComponent;
