// @flow

import * as React from 'react';
import styled from 'styled-components';

// TODO: get apiKey from context (or speak directly to FrontsAPI)

type ScrollContainerProps = {
  title: string,
  children: React.Node
};

const ScrollOuter = styled(`div`)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1rem;
`;

const ScrollTitle = styled(`h2`)`
  flex-grow: 0;
  font-size: 20px;
  font-weight: 100;
`;

const ScrollInner = styled(`div`)`
  overflow-y: scroll;
`;

const ScrollContainer = ({ title, children }: ScrollContainerProps) => (
  <ScrollOuter>
    <ScrollTitle>{title}</ScrollTitle>
    <ScrollInner>{children}</ScrollInner>
  </ScrollOuter>
);

export default ScrollContainer;
