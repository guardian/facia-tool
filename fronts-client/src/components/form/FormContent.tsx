import { styled } from 'constants/theme';
import { CardSizes } from 'types/Collection';

export const FormContent = styled.div`
	flex: 3;
	display: flex;
	flex-direction: ${(props: { size?: CardSizes }) =>
		props.size !== 'wide' ? 'column' : 'row'};
	margin-bottom: 40px;
`;
