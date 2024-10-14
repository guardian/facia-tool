import { styled } from 'constants/theme';
import { CardSizes } from 'types/Collection';

interface FormContentProps {
	size?: CardSizes;
	marginBottom?: string;
}
export const FormContent = styled.div`
	flex: 3;
	display: flex;
	flex-direction: ${(props: FormContentProps) =>
		props.size !== 'wide' ? 'column' : 'row'};
	margin-bottom: ${(props: FormContentProps) => props.marginBottom ?? 0};
`;
