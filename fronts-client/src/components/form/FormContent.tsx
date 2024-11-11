import { styled } from 'constants/theme';
import { CardSizes } from 'types/Collection';

interface FormContentProps {
	size?: CardSizes;
	marginBottom?: string;
}
export const FormContent = styled.div<FormContentProps>`
	flex: 3;
	display: flex;
	flex-direction: ${({ size }) => (size !== 'wide' ? 'column' : 'row')};
	margin-bottom: ${({ marginBottom }) => marginBottom ?? '60px'};
`;
