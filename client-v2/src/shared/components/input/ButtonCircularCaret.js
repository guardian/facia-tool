// @flow

import * as React from 'react';
import styled from 'styled-components';

import caretIcon from 'shared/images/icons/single-down.svg';
import ButtonCircular from './ButtonCircular';

const ButtonCircularWithTransition = ButtonCircular.extend`
  transition: transform 0.15s;
  vertical-align: middle;
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

export default ({ active, ...props }: { active: boolean }) => (
  <ButtonCircularWithTransition
    {...props}
    style={{ transform: active ? 'rotate(0deg)' : null }}
  >
    <CaretImg src={caretIcon} alt="" />
  </ButtonCircularWithTransition>
);
