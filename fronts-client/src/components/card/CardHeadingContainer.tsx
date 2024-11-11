import { styled } from 'constants/theme';
import { CardSizes } from 'types/Collection';

export default styled.div<{
	size: CardSizes;
}>`
	${({ size }) => size === 'small' && 'width: 100%;'}
	padding: 0 0 0 4px;
`;
