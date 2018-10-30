import React from 'react';
import styled from 'styled-components';

const ToolTip = styled('div')<{ text: string }>`
  font-family: TS3TextSans-Bold;
  font-size: 12px;
  color: #fff;
  background-color: #3a3a3a;
  padding: 2px 3px;
`;

interface Props {
  text: string;
  size?: string;
}

export default ({ text }: Props) => <ToolTip text={text}>{text}</ToolTip>;
