import { styled } from 'constants/theme';
import InputContainer from './InputContainer';

export default styled.div`
	& > ${InputContainer} {
		margin: 5px 0;
	}
	flex-wrap: wrap;
	display: flex;
	column-gap: 10px;
`;
