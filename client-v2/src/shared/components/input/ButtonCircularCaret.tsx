import React from 'react';
import { styled } from 'shared/constants/theme';

import caretIcon from 'shared/images/icons/single-down.svg';
import ButtonCircular from './ButtonCircular';

const ButtonCircularWithTransition = ButtonCircular.extend<{
  highlight?: boolean;
}>`
  transition: transform 0.15s;
  display: inline-block;
  text-align: center;
  padding: 0;
  transform: rotate(-90deg);

  ${({ highlight, theme }) =>
    highlight
      ? `background-color: ${theme.button.backgroundColorHighlight}`
      : ``};
`;

const CaretImg = styled('img')`
  width: 18px;
  display: inline-block;
  vertical-align: middle;
`;

export default ({
  active,
  preActive,
  ...props
}: { active: boolean; preActive: boolean } & React.HTMLAttributes<
  HTMLButtonElement
>) => (
  <ButtonCircularWithTransition
    {...props}
    highlight={preActive}
    style={{
      transform: active
        ? 'rotate(0deg)'
        : preActive
          ? 'rotate(-45deg)'
          : undefined
    }}
  >
    <CaretImg src={caretIcon} alt="" />
  </ButtonCircularWithTransition>
);
