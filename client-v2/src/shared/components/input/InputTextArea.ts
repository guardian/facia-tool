import { styled } from 'shared/constants/theme';
import InputBase from './InputBase';
import createInput from './CreateInput';

const InputTextAreaBase = styled(InputBase)<{
  minHeight?: number;
  maxHeight?: number;
}>`
  height: auto;
  resize: vertical;
  min-height: ${({ minHeight = 40 }) => minHeight}px;
  max-height: ${({ maxHeight = 120 }) => maxHeight}px;
`;

export default createInput(InputTextAreaBase, 'textarea');
