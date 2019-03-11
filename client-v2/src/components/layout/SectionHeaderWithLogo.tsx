import React from 'react';
import { styled } from 'constants/theme';
import { SectionHeaderUnpadded } from './SectionHeader';

const SectionHeader = styled(SectionHeaderUnpadded)`
  display: flex;
`;

const LogoTypeContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.colors.blackDark};
  display: inline-block;
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
`;

export default ({ children }: { children?: React.ReactNode }) => (
  <SectionHeader>
    <LogoTypeContainer>F</LogoTypeContainer>
    {children}
  </SectionHeader>
);
