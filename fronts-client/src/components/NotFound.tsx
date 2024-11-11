import React from 'react';
import { styled, theme } from 'constants/theme';

const NotFoundContainer = styled.div`
	background-color: ${theme.capiInterface.feedItemText};
	color: ${theme.base.colors.textLight};
	display: flex;
	font-size: 20px;
	padding: 5px;
`;

const NotFound = () => (
	<NotFoundContainer>The requested page could not be found</NotFoundContainer>
);

export default NotFound;
