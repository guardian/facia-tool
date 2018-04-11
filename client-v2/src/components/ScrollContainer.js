// @flow

import * as React from 'react';
import styled from 'styled-components';

// TODO: get apiKey from context (or speak directly to FrontsAPI)

type ScrollContainerProps = {
  fixed: React.Node,
  children: React.Node
};

const ScrollOuter = styled(`div`)`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const ScrollTitle = styled(`div`)`
  flex-grow: 0;
  font-size: 20px;
  font-weight: 100;
`;

const ScrollInner = styled(`div`)`
  overflow-y: scroll;
`;

const ScrollContainer = ({ fixed, children }: ScrollContainerProps) => (
  <ScrollOuter>
    <ScrollTitle>{fixed}</ScrollTitle>
    <ScrollInner>{children}</ScrollInner>
  </ScrollOuter>
);

export default ScrollContainer;
