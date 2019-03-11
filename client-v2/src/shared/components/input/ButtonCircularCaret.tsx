import React from 'react';
import { styled } from 'shared/constants/theme';
import ButtonCircular from './ButtonCircular';
import { DownCaretIcon } from '../icons/Icons';

export const ButtonCircularWithTransition = ButtonCircular.extend<{
  highlight?: boolean;
  small?: boolean;
}>`
  transition: transform 0.15s;
  display: inline-block;
  text-align: center;
  padding: 0;
  height: ${({ small }) => (small ? '18px' : undefined)};
  width: ${({ small }) => (small ? '18px' : undefined)};

  ${({ highlight, theme }) =>
    highlight
      ? `background-color: ${theme.shared.button.backgroundColorHighlight}`
      : ``};
`;

const CaretIcon = styled(DownCaretIcon)<{
  small?: boolean;
}>`
  width: ${({ small }) => (small ? '14px' : '18px')};
  display: inline-block;
`;

type OpenDirections = 'down' | 'right';

interface ButtonCircularCaretWithTransitionProps {
  active: boolean;
  preActive: boolean;
  small?: boolean;
  openDir?: OpenDirections;
}

const getBaseRotation = (openDir: OpenDirections) => {
  switch (openDir) {
    case 'down': {
      return 0;
    }
    case 'right': {
      return -90;
    }
  }
};

const getRotation = (
  openDir: 'down' | 'right',
  active: boolean,
  preActive: boolean
) => {
  const baseRotation = getBaseRotation(openDir);
  const activeRotation = active ? baseRotation + 180 : baseRotation;
  return preActive ? activeRotation + 45 : activeRotation;
};

export default ({
  active,
  preActive,
  small,
  openDir = 'down',
  ...props
}: ButtonCircularCaretWithTransitionProps &
  React.HTMLAttributes<HTMLButtonElement>) => (
  <ButtonCircularWithTransition
    {...props}
    small={small}
    highlight={preActive}
    style={{
      transform: `rotate(${getRotation(openDir, active, preActive)}deg)`,
      ...props.style
    }}
  >
    <CaretIcon small={small} />
  </ButtonCircularWithTransition>
);
