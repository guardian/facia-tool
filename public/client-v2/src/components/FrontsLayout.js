// @flow

import * as React from 'react';
import styled from 'styled-components';

const Container = styled(`div`)`
  display: flex;
  flex: 1;
`;
const Col = styled('div')`
  flex: 1;
  justify-content: center;
  overflow-x: scroll;
`;

type FrontLayoutProps = {
  left: React.Node,
  right: React.Node
};

const FrontLayout = ({ left, right }: FrontLayoutProps) => (
  <Container>
    <Col>{left}</Col>
    <Col>{right}</Col>
  </Container>
);

export default FrontLayout;
