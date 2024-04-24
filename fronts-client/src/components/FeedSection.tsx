import React from 'react';
import { styled, theme } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import FeedSectionHeader from './FeedSectionHeader';
import { media } from 'util/mediaQueries';
import { connect } from 'react-redux';
import { isMode } from 'selectors/pathSelectors';
import { State } from 'types/State';
import { FeastSearchContainer } from './feast/FeastSearchContainer';

interface Props {
  isClipboardOpen: boolean;
  isEditions: boolean;
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

const FeedSection = ({ isClipboardOpen, isEditions }: Props) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper isClipboardOpen={isClipboardOpen}>
        {isEditions ? <FeastSearchContainer /> : <FeedContainer />}
      </FeedWrapper>
      <Clipboard />
    </FeedSectionContent>
  </FeedSectionContainer>
);

const mapStateToProps = (state: State) => ({
  isEditions: isMode(state, 'editions'),
});

export default connect(mapStateToProps)(FeedSection);
