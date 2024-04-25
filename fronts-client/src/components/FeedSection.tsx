import React from 'react';
import { styled, theme } from 'constants/theme';

import { selectors as editionsIssueSelectors } from '../bundles/editionsIssueBundle';
import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import FeedSectionHeader from './FeedSectionHeader';
import { media } from 'util/mediaQueries';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { FeastSearchContainer } from './feast/FeastSearchContainer';

interface Props {
  isClipboardOpen: boolean;
  isFeast: boolean;
}

const FeedSectionContainer = styled.div`
  background-color: ${theme.base.colors.backgroundColor};
`;

const FeedSectionContent = styled(SectionContent)`
  padding-right: 0px;
  padding-top: 10px;
`;

const FeedWrapper = styled.div<{ isClipboardOpen: boolean }>`
  width: 409px;
  ${media.large`width: 335px;`}
  border-right: ${({ isClipboardOpen }) =>
    isClipboardOpen ? `solid 1px ${theme.base.colors.borderColor}` : null};
`;

const FeedSection = ({ isClipboardOpen, isFeast }: Props) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper isClipboardOpen={isClipboardOpen}>
        {isFeast ? <FeastSearchContainer /> : <FeedContainer />}
      </FeedWrapper>
      <Clipboard />
    </FeedSectionContent>
  </FeedSectionContainer>
);

const mapStateToProps = (state: State) => ({
  isFeast: editionsIssueSelectors.selectAll(state)?.platform === 'feast',
});

export default connect(mapStateToProps)(FeedSection);
