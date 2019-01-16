import React from 'react';
import { styled } from 'shared/constants/theme';

import caretIcon from 'shared/images/icons/single-down.svg';
import ButtonCircular from './ButtonCircular';

const ButtonCircularWithTransition = ButtonCircular.extend`
  transition: transform 0.15s;
  display: inline-block;
  text-align: center;
  padding: 0;
  transform: rotate(-90deg);
`;

const CaretImg = styled('img')`
  width: 18px;
  display: inline-block;
  vertical-align: middle;
`;

export default ({
  active,
  ...props
}: { active: boolean } & React.HTMLAttributes<HTMLButtonElement>) => (
  <ButtonCircularWithTransition
    {...props}
    style={{ transform: active ? 'rotate(0deg)' : undefined }}
  >
    <CaretImg src={caretIcon} alt="" />
  </ButtonCircularWithTransition>
);
