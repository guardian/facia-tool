import React from 'react';
import { styled } from 'shared/constants/theme';

interface ContainerButtonWithLabelProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  icon?: any | null;
  className?: string;
}

const ContainerButton = styled('button')`
  cursor: pointer;
  font-family: TS3TextSans-Bold;
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
  vertical-align: sub;
  padding-inline-end: 5px;
`;

const Icon = styled('img')<{
  small?: boolean;
}>`
  width: ${({ small }) => (small ? '14px' : '18px')};
  display: inline-block;
  vertical-align: -webkit-baseline-middle;
`;

export default ({
  onClick,
  label,
  icon,
  className
}: ContainerButtonWithLabelProps) => (
  <ContainerButton className={className} onClick={onClick}>
    <Label>{label}</Label>
    {!!icon ? <Icon src={icon} alt={label} /> : null}
  </ContainerButton>
);
