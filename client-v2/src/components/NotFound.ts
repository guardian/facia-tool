

import React from 'react';
import styled from 'styled-components';

const NotFoundContainer = styled('div')`
  background-color: #221133;
  color: white;
  display: flex;
  font-size: 20px;
  padding: 5px;
`;

const NotFound = () => (
  <NotFoundContainer>The requested page could not be found</NotFoundContainer>
);

export default NotFound;
