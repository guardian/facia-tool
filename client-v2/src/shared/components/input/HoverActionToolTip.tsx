import React from 'react';
import { styled } from 'shared/constants/theme';

const ToolTip = styled('div')<{ text: string }>`
  font-family: TS3TextSans-Bold;
  font-size: 12px;
  color: ${({ theme }) => theme.shared.button.color};
  background-color: ${({ theme }) => theme.shared.base.colors.button};
  padding: 2px 3px;
`;

interface Props {
  text: string;
  size?: string;
}

export default ({ text }: Props) => <ToolTip text={text}>{text}</ToolTip>;
