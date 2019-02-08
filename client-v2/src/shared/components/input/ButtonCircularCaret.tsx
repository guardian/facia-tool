import React from 'react';
import { styled } from 'shared/constants/theme';

import caretIcon from 'shared/images/icons/single-down.svg';
import ButtonCircular from './ButtonCircular';

export const ButtonCircularWithTransition = ButtonCircular.extend<{
  highlight?: boolean;
  small?: boolean;
}>`
  transition: transform 0.15s;
  display: inline-block;
  text-align: center;
  padding: 0;
  transform: rotate(0deg);
  height: ${({ small }) => (small ? '18px' : undefined)};
  width: ${({ small }) => (small ? '18px' : undefined)};

  ${({ highlight, theme }) =>
    highlight
      ? `background-color: ${theme.shared.button.backgroundColorHighlight}`
      : ``};
`;

const CaretImg = styled('img')<{
  small?: boolean;
}>`
  width: ${({ small }) => (small ? '14px' : '18px')};
  display: inline-block;
`;

interface ButtonCircularCaretWithTransitionProps {
  active: boolean;
  preActive: boolean;
  small?: boolean;
}

export default ({
  active,
  preActive,
  small,
  ...props
}: ButtonCircularCaretWithTransitionProps &
  React.HTMLAttributes<HTMLButtonElement>) => (
  <ButtonCircularWithTransition
    {...props}
    small={small}
    highlight={preActive}
    style={{
      transform: active
        ? 'rotate(-180deg)'
        : preActive
        ? 'rotate(-45deg)'
        : undefined
    }}
  >
    <CaretImg src={caretIcon} alt="" small={small} />
  </ButtonCircularWithTransition>
);
