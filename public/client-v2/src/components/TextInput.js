// @flow

import * as React from 'react';
import styled from 'styled-components';

const InputWrapper = styled('span')`
  position: relative;
  width: ${({ width }) => width || 'auto'};
`;

const Input = styled(`input`)`
  appearance: none;
  background: transparent;
  border: none;
  border-bottom: 1px solid #fff;
  color: #fff;
  width: ${({ width }) => width || 'auto'}

  :focus {
    border-bottom: 2px solid #fff;
    outline: none;
  }

  ::placeholder {
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
  }
`;

const ClearButton = styled('button')`
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  height: 0.8em;
  margin: -0.4em 0 0 0;
  padding: 0;
  position: absolute;
  right: 0.4em;
  top: 50%;
  width: 0.8em;

  ::before {
    content: 'x';
    font-size: 1em;
    line-height: 1;
  }

  :focus {
    outline: none;
    font-weight: bold;
  }
`;

type TextInputProps = {
  onClear?: () => void,
  width?: string
};

const TextInput = ({ onClear, ...props }: TextInputProps) => (
  <InputWrapper {...props}>
    <Input {...props} />
    {onClear && <ClearButton onClick={onClear} />}
  </InputWrapper>
);

export default TextInput;
