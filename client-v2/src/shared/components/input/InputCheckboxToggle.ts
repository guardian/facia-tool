

import styled from 'styled-components';
import * as React from 'react';
import { type FieldProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';

const CheckboxContainer = styled('div')`
  display: flex;
`;

const Label = InputLabel.extend`
  color: ${props => props.theme.base.colors.textMuted};
`;

const Switch = styled('div')`
  position: relative;
  width: 40px;
  margin-left: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const CheckboxLabel = styled('label')`
  display: block;
  overflow: hidden;
  cursor: pointer;
  height: 24px;
  padding: 0;
  line-height: 24px;
  border: 2px solid #e3e3e3;
  border-radius: 24px;
  background-color: #ffffff;
  transition: background-color 0.1s ease-in;
  :before {
    content: '';
    display: block;
    width: 24px;
    margin: 0px;
    background: #ffffff;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 16px;
    border: 2px solid #e3e3e3;
    border-radius: 24px;
    transition: all 0.1s ease-in 0s;
  }
`;

const Checkbox = styled('input')`
  display: none;
  :checked + ${CheckboxLabel} {
    background-color: ${props => props.theme.base.colors.highlight};
  }
  &:checked + ${CheckboxLabel}, &:checked + ${CheckboxLabel}:before {
    border-color: ${props => props.theme.base.colors.highlight};
    right: 0px;
  }
`;

type Props = {
  label?: string
} & FieldProps;

export default ({ label, input, ...rest }: Props) => (
  <InputContainer>
    <CheckboxContainer>
      <Label size="sm">{label}</Label>
      <Switch onClick={() => input.onChange(!input.checked)}>
        <Checkbox type="checkbox" {...input} {...rest} id={label} />
        <CheckboxLabel for={label} />
      </Switch>
    </CheckboxContainer>
  </InputContainer>
);
