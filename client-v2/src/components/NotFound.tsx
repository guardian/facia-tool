import React from 'react';
import { styled } from 'constants/theme';

const NotFoundContainer = styled('div')`
  background-color: ${({ theme }) => theme.capiInterface.feedItemText};
  color: ${({ theme }) => theme.shared.base.colors.textLight};
  display: flex;
  font-size: 20px;
  padding: 5px;
`;

const NotFound = () => (
  <NotFoundContainer>The requested page could not be found</NotFoundContainer>
);

export default NotFound;
