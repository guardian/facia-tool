import { styled, css } from 'shared/constants/theme';
import React from 'react';
import { WrappedFieldProps } from 'redux-form';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';

const CheckboxContainer = styled('div')<{ addBorder: boolean }>`
  display: flex;
  ${({ addBorder }) =>
    addBorder &&
    css`
      border-bottom: ${({ theme }) =>
        `1px solid ${theme.shared.base.colors.borderColor}`};
      padding-bottom: 6px;
    `}
`;

const Label = InputLabel.extend`
  color: ${props => props.theme.shared.input.colorLabel};
  flex: 1;
  cursor: pointer;
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
  border: ${({ theme }) => `2px solid ${theme.shared.input.checkboxBorderColor}`};
  border-radius: 24px;
  background-color: ${({ theme }) => theme.shared.input.checkboxBorderColor};
  transition: background-color 0.1s ease-in;
  :before {
    content: '';
    display: block;
    width: 24px;
    height: 24px;
    margin: 0px;
    background: ${({ theme }) => theme.shared.input.checkboxColorInactive};
    position: absolute;
    top: 0;
    bottom: 0;
    right: 16px;
    border: ${({ theme }) => `2px solid ${theme.shared.input.checkboxBorderColor}`};
    border-radius: 24px;
    transition: all 0.1s ease-in 0s;
  }
`;

const Checkbox = styled('input')`
  display: none;
  :checked + ${CheckboxLabel} {
    background-color: ${({ theme }) => theme.shared.input.checkboxColorActive};
  }
  &:checked + ${CheckboxLabel}, &:checked + ${CheckboxLabel}:before {
    border-color: ${({ theme }) => theme.shared.input.checkboxColorActive};
    right: 0px;
  }
`;

type Props = {
  label?: string;
  id: string;
  dataTestId: string;
  addBorder?: boolean;
} & WrappedFieldProps;

export default ({
  label,
  id,
  dataTestId,
  addBorder = true,
  input: { onChange, ...inputRest },
  ...rest
}: Props) => (
  <>
    <InputContainer data-testid={dataTestId}>
      <CheckboxContainer addBorder={addBorder}>
        <Label htmlFor={id} size="sm">
          {label}
        </Label>
        <Switch>
          <Checkbox
            type="checkbox"
            onChange={() => onChange(!inputRest.checked)}
            {...inputRest}
            {...rest}
            id={id}
          />
          <CheckboxLabel htmlFor={id} />
        </Switch>
      </CheckboxContainer>
    </InputContainer>
  </>
);
