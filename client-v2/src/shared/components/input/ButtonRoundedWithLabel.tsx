import React, { ReactNode } from 'react';
import { styled } from 'shared/constants/theme';

interface ContainerButtonWithLabelProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  icon?: ReactNode | null;
  className?: string;
}

const ContainerButton = styled('button')`
  cursor: pointer;
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: 12px;
  padding: 0 6px 0 8px;
  border: ${({ theme }) => `solid 1px ${theme.shared.colors.greyMediumLight}`};
  border-radius: 20px;
  :focus {
    outline: none;
  }
`;

const Label = styled('div')`
  display: inline-block;
  padding: 3px 5px 3px 0;
`;

export default ({
  onClick,
  label,
  icon,
  className
}: ContainerButtonWithLabelProps) => (
  <ContainerButton className={className} onClick={onClick}>
    <Label>{label}</Label>
    {!!icon ? icon : null}
  </ContainerButton>
);
