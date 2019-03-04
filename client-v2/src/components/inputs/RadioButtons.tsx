import React from 'react';
import { styled } from 'constants/theme';

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
  background: ${({ theme }) => theme.shared.base.colors.backgroundColorFocused};
  /* Check mark */
  &:after {
    position: absolute;
    display: none;
    content: '';
  }
`;

const ControlRadio = styled('label')<{ inline?: boolean }>`
  position: relative;
  display: ${({ inline }) => (inline ? 'inline' : 'block')};
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
    border:  ${({ theme }) => `solid 1px ${theme.shared.input.borderColor}`};
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
      background:${({ theme }) =>
        theme.base.colors.radioButtonBackgroundDisabled};
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
      background-color: ${({ theme }) =>
        theme.shared.base.colors.highlightColor};
    }

    ${Input}:hover:not(:checked) ~ ${ControlIndicator}:after {
      background-color: ${({ theme }) =>
        theme.shared.base.colors.highlightColor};
    }
  }

  /* Disabled circle colour */
  & ${Input}:disabled ~ ${ControlIndicator}:after {
    background:${({ theme }) => theme.shared.colors.greyMedium};
  }
`;

const RadioButton = ({
  label,
  checked = false,
  disabled = false,
  inline = false,
  ...rest
}: {
  label: string;
  inline?: boolean;
  checked?: boolean;
  disabled?: boolean;
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
