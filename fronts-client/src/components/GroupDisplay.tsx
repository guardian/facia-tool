import React from 'react';
import { styled } from 'constants/theme';

interface GroupDisplayComponentProps {
	groupName: string | null;
}

const GroupHeading = styled.div`
	border-left: 1px solid #ccc;
	border-top: 1px solid #ccc;
	font-size: 14px;
	font-weight: bold;
	padding: 0.25em 0.25em 0;
	text-transform: capitalize;
`;

const GroupDisplayComponent = ({ groupName }: GroupDisplayComponentProps) =>
	groupName ? (
		<div data-testid={groupName}>
			<GroupHeading style={{ margin: 0 }}>{groupName}</GroupHeading>
		</div>
	) : null;

export default GroupDisplayComponent;
