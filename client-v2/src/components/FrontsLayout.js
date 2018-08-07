// @flow

import * as React from 'react';
import styled from 'styled-components';

const Container = styled(`div`)`
  display: flex;
  height: 100%;
  flex: 1;
  width: 100%;
`;
const Col = styled('div')`
  display: flex;
  flex: 1;
`;

type FrontLayoutProps = {
  left: React.Node,
  middle: React.Node,
  right: React.Node
};

const FrontLayout = ({ left, right, middle }: FrontLayoutProps) => (
  <Container>
    <Col>{left}</Col>
    <Col>{middle}</Col>
    <Col>{right}</Col>
  </Container>
);

export default FrontLayout;
