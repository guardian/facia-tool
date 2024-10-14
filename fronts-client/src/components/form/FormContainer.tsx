import { styled, theme } from 'constants/theme';
import ContentContainer from '../layout/ContentContainer';

export const FormContainer = styled(ContentContainer.withComponent('form'))`
	display: flex;
	flex-direction: column;
	flex: 1;
	background-color: ${theme.base.colors.formBackground};
`;
