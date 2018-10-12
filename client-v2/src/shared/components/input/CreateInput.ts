

import * as React from 'react';
import { FieldProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';

type Props = {
  label?: string
} & FieldProps;

export default (Component: React.ElementType, type?: string) => ({
  label,
  input,
  ...rest
}: Props) => (
  <InputContainer>
    {label && <InputLabel for={label}>{label}</InputLabel>}
    <Component id={label} {...input} {...rest} type={type} />
  </InputContainer>
);
