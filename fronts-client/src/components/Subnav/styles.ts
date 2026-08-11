import { styled } from 'constants/theme';

export const SubnavContainer = styled.div`
	padding: 70px 20px 40px;
	max-width: 720px;
`;

export const SubnavContainerHeading = styled.h1`
	font-family: GHGuardianHeadline, Georgia, serif;
	font-size: 24px;
	font-weight: 500;
	margin-bottom: 16px;
`;

export const Message = styled.p`
	color: ${({ theme }) => theme.base.colors.textDark};
	font-size: 14px;
`;
