import React from 'react';
import styled from 'styled-components';

const ToolTip = styled('div')<{ text: string }>`
  position: absolute;
  z-index: 1;
  font-family: TS3TextSans-Bold;
  top: -17px;
  font-size: 12px;
`;

interface Props {
  text: string;
}

export default ({ text }: Props) => <ToolTip text={text}>{text}</ToolTip>;
