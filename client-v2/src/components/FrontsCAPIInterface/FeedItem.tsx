import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import { styled, theme as styleTheme } from 'constants/theme';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import { getPillarColor, notLiveColour } from 'shared/util/getPillarColor';
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
import { getPaths } from 'util/paths';
import { liveBlogTones } from 'constants/fronts';
import { ThumbnailSmall } from 'shared/components/Thumbnail';

const LinkContainer = styled('div')`
  background-color: ${({ theme }) => theme.capiInterface.backgroundLight};
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
  border-top: ${({ theme }) => `1px solid ${theme.capiInterface.borderLight}`};
  color: ${({ theme }) => theme.capiInterface.feedItemText};
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
  font-family: GHGuardianHeadline;
  font-size: 16px;
  font-weight: 500;
`;

const VisitedWrapper = styled.a`
  text-decoration: none;
  display: flex;
  color: inherit;
  cursor: auto;
  :visited ${Title} {
    color: ${({ theme }) => theme.capiInterface.textVisited};
  }
`;

const MetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0px 2px;
`;

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const ScheduledPublication = styled(FirstPublished)`
  color: ${notLiveColour};
`;

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans;
  font-weight: bold;
`;

const Body = styled('div')`
  width: calc(100% - 163px);
  padding-left: 8px;
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
  scheduledPublicationDate?: string;
  tone?: string;
  thumbnail?: string;
}

const dragStart = (
  href: string | void,
  event: React.DragEvent<HTMLDivElement>
) => {
  event.dataTransfer.setData('capi', href || '');
};

const getArticleLabel = (
  firstPublicationDate: string | undefined,
  sectionName: string,
  isLive: boolean,
  tone?: string
) => {
  if (!isLive) {
    if (firstPublicationDate) {
      return notLiveLabels.takenDown;
    }
    return notLiveLabels.draft;
  }

  if (tone === liveBlogTones.dead || tone === liveBlogTones.live) {
    return startCase(liveBlogTones.live);
  }

  return startCase(sectionName);
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
  onAddToClipboard = noop,
  scheduledPublicationDate,
  tone,
  thumbnail
}: FeedItemProps) => (
  <Container
    data-testid="feed-item"
    draggable={true}
    onDragStart={event => dragStart(internalPageCode, event)}
  >
    <VisitedWrapper
      href={getPaths(id).live}
      onClick={e => e.preventDefault()}
      aria-disabled
    >
      <MetaContainer>
        <Tone
          style={{
            color:
              getPillarColor(pillarId, isLive, tone === liveBlogTones.dead) ||
              styleTheme.capiInterface.textLight
          }}
        >
          {getArticleLabel(firstPublicationDate, sectionName, isLive, tone)}
        </Tone>
        {scheduledPublicationDate && (
          <ScheduledPublication>
            {distanceInWordsStrict(
              new Date(scheduledPublicationDate),
              Date.now()
            )}
          </ScheduledPublication>
        )}
        {publicationDate && (
          <FirstPublished>
            {distanceInWordsStrict(Date.now(), new Date(publicationDate))}
          </FirstPublished>
        )}
        <ShortVerticalPinline />
      </MetaContainer>
      <Body>
        <Title data-testid="headline">{title}</Title>
      </Body>
      <ThumbnailSmall
        style={{
          backgroundImage: `url('${thumbnail}')`
        }}
      />
    </VisitedWrapper>
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
