import React from 'react';
import { styled } from 'constants/theme';
import { SectionHeaderUnpadded } from './SectionHeader';

const SectionHeader = styled(SectionHeaderUnpadded)`
  display: flex;
`;

const LogoTypeContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.colors.blackDark};
  display: inline-block;
  text-align: center;
  height: 60px;
  width: 60px;
  line-height: 60px;
`;

export default ({
  children,
  includeBorder,
  greyHeader
}: {
  children?: React.ReactNode;
  includeBorder?: boolean;
  greyHeader?: boolean;
}) => (
  <SectionHeader greyHeader={greyHeader} includeBorder={includeBorder}>
    <LogoTypeContainer>F</LogoTypeContainer>
    {children}
  </SectionHeader>
);
