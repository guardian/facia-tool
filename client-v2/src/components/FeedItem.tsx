import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import styled from 'styled-components';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import { getPillarColor } from 'shared/util/getPillarColor';
import { notLiveLabels } from 'constants/fronts';
import { HoverActionsAreaOverlay } from 'shared/components/CollectionHoverItems';
import { HoverActionsButtonWrapper } from 'shared/components/input/HoverActionButtonWrapper';
import {
  HoverViewButton,
  HoverOphanButton,
  HoverAddToClipboardButton
} from 'shared/components/input/HoverActionButtons';

import { insertArticleFragment } from 'actions/ArticleFragments';
import noop from 'lodash/noop';

const LinkContainer = styled('div')`
  background-color: #f6f6f6;
  display: none;
  position: absolute;
  bottom: 20px;
  right: 10px;
  border-radius: 2px;
  padding: 1px 3px;
`;

const Container = styled('div')`
  display: flex;
  position: relative;
  border-top: solid 1px #c9c9c9;
  color: #221133;
  display: flex;
  font-weight: 400;
  padding-bottom: 20px;

  ${HoverActionsAreaOverlay} {
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    visibility: hidden;
    opacity: 0;
  }

  :hover ${LinkContainer} {
    display: block;
  }

  :hover ${HoverActionsAreaOverlay} {
    visibility: visible;
    opacity: 1;
  }
`;

const Title = styled(`h2`)`
  margin: 2px 0 0;
  vertical-align: top;
  font-family: GHGuardianHeadline-Medium;
  font-size: 16px;
  font-weight: 500;
`;

const MetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0px 8px;
`;

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans-Bold;
`;

const Body = styled('div')`
  width: calc(100% - 80px);
  padding-left: 10px;
`;

interface FeedItemProps {
  id: string;
  title: string;
  href: string;
  sectionName: string;
  pillarId?: string;
  internalPageCode: string | void;
  publicationDate?: string;
  firstPublicationDate?: string;
  isLive: boolean;
  onAddToClipboard: (id: string) => void;
}

const dragStart = (
  href: string | void,
  event: React.DragEvent<HTMLDivElement>
) => {
  event.dataTransfer.setData('capi', href || '');
};

const FeedItem = ({
  id,
  title,
  href,
  sectionName,
  pillarId,
  publicationDate,
  internalPageCode,
  firstPublicationDate,
  isLive,
  onAddToClipboard = noop
}: FeedItemProps) => (
  <Container
    data-testid="feed-item"
    draggable={true}
    onDragStart={event => dragStart(internalPageCode, event)}
  >
    <MetaContainer>
      <Tone
        style={{
          color: getPillarColor(pillarId, isLive) || '#c9c9c9'
        }}
      >
        {isLive && startCase(sectionName)}
        {!isLive &&
          (firstPublicationDate
            ? notLiveLabels.takendDown
            : notLiveLabels.draft)}
      </Tone>
      {publicationDate && (
        <FirstPublished>
          {distanceInWords(new Date(publicationDate))}
        </FirstPublished>
      )}
      <ShortVerticalPinline />
    </MetaContainer>
    <Body>
      <Title data-testid="headline">{title}</Title>
    </Body>
    <HoverActionsAreaOverlay justify="flex-end" data-testid="hover-overlay">
      <HoverActionsButtonWrapper
        buttons={[
          { text: 'Clipboard', component: HoverAddToClipboardButton },
          { text: 'View', component: HoverViewButton },
          { text: 'Ophan', component: HoverOphanButton }
        ]}
        buttonProps={{
          isLive,
          urlPath: id,
          onAddToClipboard: () => onAddToClipboard(id)
        }}
        toolTipPosition={'top'}
        toolTipAlign={'right'}
      />
    </HoverActionsAreaOverlay>
  </Container>
);

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (id: string) =>
      dispatch(
        insertArticleFragment(
          { type: 'clipboard', id: 'clipboard', index: 0 },
          id,
          'clipboard'
        )
      )
  };
};

export default connect(
  null,
  mapDispatchToProps
)(FeedItem);
