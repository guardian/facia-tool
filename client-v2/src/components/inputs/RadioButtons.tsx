import React from 'react';
import styled from 'styled-components';

const RadioGroup = styled('div')`
  text-align: left;
  vertical-align: top;
`;

const Input = styled('input')`
  position: absolute;
  z-index: -1;
  opacity: 0;
`;

const ControlIndicator = styled('div')`
  position: absolute;
  top: 2px;
  left: 0;
  width: 18px;
  height: 18px;
  background: #fff;
  /* Check mark */
  &:after {
    position: absolute;
    display: none;
    content: '';
  }
`;

const ControlRadio = styled('label')<{ inline?: boolean }>`
  position: relative;
  display: ${({ inline }) => (inline ? 'inline-block' : 'block')};
  padding-left: 24px;
  padding-top: 3px;
  cursor: pointer;
  font-family: TS3TextSans-Bold;
  font-size: 12px;

  & + & {
    margin-left: 10px;
  }

  & > ${ControlIndicator} {
    border-radius: 50%;
    border: solid 1px #c9c9c9;
  }

  /* Checked state */
  & {
    ${Input}:checked ~ ${ControlIndicator} {

    }
  }

  /* Disabled state */
  & {
    ${Input}:disabled ~ ${ControlIndicator} {
      pointer-events: none;
      opacity: 0.6;
      background: #e6e6e6;
    }
  }

  /* Show check mark */
  & {
    ${Input}:checked ~ ${ControlIndicator}:after,
    ${Input}:hover:not([disabled]) ~ ${ControlIndicator}:after {
      display: block;
    }
  }

  /* Radio button inner circle */
  & {
    ${ControlIndicator}:after {
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #ff7f0f;
    }

    ${Input}:hover:not(:checked) ~ ${ControlIndicator}:after {
      background-color: #ff7f0f66;
    }
  }

  /* Disabled circle colour */
  & ${Input}:disabled ~ ${ControlIndicator}:after {
    background: #7b7b7b;
  }
`;

const RadioButton = ({
  label,
  checked = false,
  disabled = false,
  inline = false,
  ...rest
}: {
  label: string,
  inline?: boolean,
  checked?: boolean,
  disabled?: boolean
} & React.HTMLAttributes<HTMLInputElement>) => (
  <ControlRadio inline={inline}>
    {label}
    <Input
      type="radio"
      name="radio"
      checked={checked}
      disabled={disabled}
      {...rest}
    />
    <ControlIndicator />
  </ControlRadio>
);

export { RadioButton, RadioGroup };
