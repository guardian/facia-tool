// @flow

import InputBase from './InputBase';
import createInput from './CreateInput';

const InputTextAreaBase = InputBase.withComponent('textarea').extend`
  height: auto;
  resize: none;
`;

export default createInput(InputTextAreaBase);
