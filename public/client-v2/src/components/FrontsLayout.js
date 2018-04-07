// @flow

import * as React from 'react';
import styled from 'styled-components';

const Container = styled(`div`)`
  display: flex;
  flex: 1;
`;
const Col = styled('div')`
  display: flex;
  flex: 1;
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
