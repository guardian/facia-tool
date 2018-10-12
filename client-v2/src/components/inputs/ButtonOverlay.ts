

import * as React from 'react';
import { css } from 'styled-components';

import Button from 'shared/components/input/ButtonDefault';

const ButtonWithShadow = Button.extend`
  box-shadow: 0 1px 10px 2px rgba(0, 0, 0, 0.15);
  width: 50px;
  height: 50px;
  padding: 5px;
  border-radius: 100%;
  background-color: #121212;
  transition: transform 0.15s, background-color 0.15s;
  ${({ active }) =>
    active &&
    css`
      transform: rotate(45deg);
      background-color: #ff7f0f;
      &:hover {
        background-color: #ff983f;
      }
    `};
`;

const ButtonOverlay = ({ children, ...rest }: { children: React.Node }) => (
  <ButtonWithShadow {...rest}>{children}</ButtonWithShadow>
);

export default ButtonOverlay;
