import InputBase from './InputBase';
import { createResizeableTextInput } from './CreateResizeableTextInput';

const InputTextAreaBase = InputBase.withComponent('textarea').extend<{
  minHeight?: number;
  maxHeight?: number;
}>`
  resize: vertical;
  min-height: ${({ minHeight = 40 }) => minHeight}px;
  max-height: ${({ maxHeight = 120 }) => maxHeight}px;
`;

export default createResizeableTextInput(InputTextAreaBase);
