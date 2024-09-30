import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

const ToolTip = styled.div<{ text: string }>`
	font-family: TS3TextSans;
	font-weight: bold;
	font-size: 12px;
	color: ${theme.button.color};
	background-color: ${theme.base.colors.button};
	padding: 2px 3px;
`;

interface Props {
	text: string;
	size?: string;
}

export default ({ text }: Props) => <ToolTip text={text}>{text}</ToolTip>;
