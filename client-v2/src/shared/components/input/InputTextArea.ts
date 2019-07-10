import InputBase from './InputBase';
import createInput from './CreateInput';

const InputTextAreaBase = InputBase.withComponent('textarea').extend<{
  minHeight?: number;
  maxHeight?: number;
}>`
  resize: vertical;
  min-height: ${({ minHeight = 40 }) => minHeight}px;
  max-height: ${({ maxHeight = 120 }) => maxHeight}px;
`;

export default createInput(InputTextAreaBase);
