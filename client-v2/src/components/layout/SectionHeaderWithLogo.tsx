import React from 'react';
import { styled } from 'constants/theme';
import FrontsLogo from 'images/icons/fronts-logo.svg';
import { SectionHeaderUnpadded } from './SectionHeader';

const SectionHeader = styled(SectionHeaderUnpadded)`
  display: flex;
`;

const LogoTypeContainer = styled('div')`
  background-color: #121212;
  display: inline-block;
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
`;

const LogoContainer = styled('div')`
  background-color: #515151;
  position: relative;
  display: inline-block;
  vertical-align: top;
`;

const LogoBackground = styled('div')`
  display: flex;
  flex-direction: row;
  width: 60px;
  height: 60px;
`;

const Logo = styled('img')`
  margin: auto;
  width: 38px;
  height: 24px;
`;

export default ({ children }: { children?: React.ReactNode }) => (
  <SectionHeader>
    <LogoTypeContainer>F</LogoTypeContainer>
    <LogoContainer>
      <LogoBackground>
        <Logo src={FrontsLogo} alt="The Fronts tool" />
      </LogoBackground>
    </LogoContainer>
    {children}
  </SectionHeader>
);
