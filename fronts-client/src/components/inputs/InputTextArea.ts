import styled from 'styled-components';
import InputBase from './InputBase';
import { createResizeableTextInput } from './CreateResizeableTextInput';

const InputTextAreaBase = styled(InputBase.withComponent('textarea'))<{
	minHeight?: number;
	maxHeight?: number;
}>`
	resize: vertical;
	min-height: ${({ minHeight = 40 }) => minHeight}px;
`;

export default createResizeableTextInput(InputTextAreaBase);
