import React from 'react';
import { styled } from 'constants/theme';
import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import CurrentFrontsList from './CurrentFrontsList';
import FrontsLogo from 'images/icons/fronts-logo.svg';
import Button from 'shared/components/input/ButtonDefault';

const FeedbackButton = Button.extend<{
  href: string;
  target: string;
}>`
  margin-left: auto;
  align-self: center;
  margin-right: 10px;
  line-height: 24px;
`.withComponent('a');

const SectionHeaderContent = styled('div')`
  position: relative;
  // overflow: hidden;
  flex: 1;
`;

const LogoContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.colors.greyMediumDark};
  position: relative;
  display: flex;
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

class FeedSectionHeader extends React.Component<
  {},
  { isCurrentFrontsMenuOpen: boolean }
> {
  public state = {
    isCurrentFrontsMenuOpen: false
  }

  public render() {
    return (
      <SectionHeaderWithLogo>
        <LogoContainer onClick={this.toggleCurrentFrontsMenu}>
          <LogoBackground>
            <Logo src={FrontsLogo} alt="The Fronts tool" />
          </LogoBackground>
        </LogoContainer>
        <SectionHeaderContent>
          {this.state.isCurrentFrontsMenuOpen ? (
            <CurrentFrontsList />
          ) : (
            <FeedbackButton
              href="https://docs.google.com/forms/d/e/1FAIpQLSc4JF0GxrKoxQgsFE9_tQfjAo1RKRU4M5bJWJRKaVlHbR2rpA/viewform?c=0&w=1"
              target="_blank"
            >
              Send us feedback
            </FeedbackButton>
          )}
        </SectionHeaderContent>
      </SectionHeaderWithLogo>
    );
  }

  private toggleCurrentFrontsMenu = () => {
    this.setState({
      isCurrentFrontsMenuOpen: !this.state.isCurrentFrontsMenuOpen
    })
  }
}

export default FeedSectionHeader;
