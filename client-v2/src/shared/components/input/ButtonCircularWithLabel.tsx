import React from 'react';
import { styled } from 'shared/constants/theme';

interface ContainerButtonWithLabelProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}

const ContainerButtonDiv = styled('div')`
  cursor: pointer;
  font-family: TS3TextSans-Bold;
  font-size: 14px;
  height: 100%;
`;

const ContainerButtonLabel = styled('div')`
  display: inline-block;
  vertical-align: top;
  margin-right: 5px;
`;

export default ({
  onClick,
  label,
  className,
  children
}: ContainerButtonWithLabelProps) => (
  <ContainerButtonDiv className={className} onClick={onClick}>
    <ContainerButtonLabel>{label} </ContainerButtonLabel>
    {children}
  </ContainerButtonDiv>
);
