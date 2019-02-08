import React from 'react';
import { styled } from 'constants/theme';
// TODO: get apiKey from context (or speak directly to FrontsAPI)

interface ScrollContainerProps {
  fixed: React.ReactNode;
  children: React.ReactNode;
}

const ScrollOuter = styled(`div`)`
  position: relative;
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
`;

const ScrollTitle = styled(`div`)`
  flex-grow: 0;
`;

const ScrollInner = styled(`div`)`
  overflow-y: scroll;
  display: block;
  height: 100%;
`;

const ScrollContainer = ({ fixed, children }: ScrollContainerProps) => (
  <ScrollOuter>
    <ScrollTitle>{fixed}</ScrollTitle>
    <ScrollInner>{children}</ScrollInner>
  </ScrollOuter>
);

export default ScrollContainer;
