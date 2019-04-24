import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { StyledProps } from 'styled-components';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { RewindIcon } from '../icons/Icons';
import { styled } from 'constants/theme';

type Props = {
  label?: string;
  // If provided, the user can revert to this value by clicking the 'rewind' button.
  originalValue?: string;
} & WrappedFieldProps;

const RewindButton = styled.button.attrs({
  type: 'button'
})`
  background: transparent;
  display: inline-block;
  border: none;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  &:active,
  &:focus {
    outline: none;
  }
`;

const InputComponentContainer = styled.div`
  position: relative;
  &:hover {
    ${RewindButton} {
      display: block;
    }
  }
`;

export default (
  Component: new (props: any) => React.Component<
    React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
  >,
  type?: string
) => ({ label, input, originalValue, ...rest }: Props) => (
  <InputContainer>
    {label && (
      <InputLabel htmlFor={label}>
        {label}
        {originalValue && input.value !== originalValue && (
          <RewindButton onClick={() => input.onChange(originalValue)}>
            <RewindIcon />
          </RewindButton>
        )}
      </InputLabel>
    )}
    <InputComponentContainer>
      <Component id={label} {...input} {...rest} type={type} />
    </InputComponentContainer>
  </InputContainer>
);
