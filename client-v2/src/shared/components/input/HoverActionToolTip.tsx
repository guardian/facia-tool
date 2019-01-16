import React from 'react';
import { styled } from 'shared/constants/theme';

const ToolTip = styled('div')<{ text: string }>`
  font-family: TS3TextSans-Bold;
  font-size: 12px;
  color: ${({ theme }) => theme.button.color};
  background-color: ${({ theme }) => theme.base.colors.button};
  padding: 2px 3px;
`;

interface Props {
  text: string;
  size?: string;
}

export default ({ text }: Props) => <ToolTip text={text}>{text}</ToolTip>;
