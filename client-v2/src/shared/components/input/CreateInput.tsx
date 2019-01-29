import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { StyledProps } from 'styled-components';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';

type Props = {
  label?: string;
} & WrappedFieldProps;

export default (
  Component: new (props: any) => React.Component<
    React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
  >,
  type?: string
) => ({ label, input, ...rest }: Props) => (
  <InputContainer>
    {label && <InputLabel htmlFor={label}>{label}</InputLabel>}
    <Component id={label} {...input} {...rest} type={type} />
  </InputContainer>
);
