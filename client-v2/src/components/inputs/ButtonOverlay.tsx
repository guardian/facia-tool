import React from 'react';
import { styled } from 'constants/theme';
import { css } from 'styled-components';

import Button from 'shared/components/input/ButtonDefault';

const ButtonWithShadow = styled(Button)<{ active?: boolean }>`
  box-shadow: 0 1px 10px 2px rgba(0, 0, 0, 0.15);
  width: 50px;
  height: 50px;
  padding: 5px;
  border-radius: 100%;
  background-color: ${({ theme }) => theme.shared.colors.blackDark};
  transition: transform 0.15s, background-color 0.15s;
  ${({ active }) =>
    active &&
    css`
      transform: rotate(45deg);
      background-color: ${({ theme }) =>
        theme.shared.button.backgroundColorHighlight};
      &:hover {
        background-color: ${({ theme }) => theme.shared.colors.orangeDark};
      }
    `};
`;

const ButtonOverlay = ({
  children,
  ...rest
}: { children: React.ReactNode; active?: boolean } & React.HTMLAttributes<
  HTMLButtonElement
>) => <ButtonWithShadow {...rest}>{children}</ButtonWithShadow>;

export default ButtonOverlay;
