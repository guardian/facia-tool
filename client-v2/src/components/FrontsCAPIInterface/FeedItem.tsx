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
import { CapiArticle } from 'types/Capi';
import { getThumbnail } from 'util/CAPIUtils';

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
  font-size: 15px;
  font-weight: 500;
`;

const VisitedWrapper = styled.a`
  text-decoration: none;
  display: flex;
  color: inherit;
  cursor: pointer;
  width: 100%;
  :visited ${Title} {
    color: ${({ theme }) => theme.capiInterface.textVisited};
  }
`;

const MetaContainer = styled('div')`
  position: relative;
  min-width: 80px;
  padding: 0px 2px;
`;

const FirstPublished = styled('div')`
  font-size: 11px;
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
  padding-left: 8px;
`;

interface FeedItemProps {
  article: CapiArticle;
  onAddToClipboard: (article: CapiArticle) => void;
}

const dragStart = (
  article: CapiArticle,
  event: React.DragEvent<HTMLDivElement>
) => {
  event.dataTransfer.setData('capi', JSON.stringify(article));
};

const isLive = (article: CapiArticle) =>
  !article.fields.isLive || article.fields.isLive === 'true';

const getArticleLabel = (article: CapiArticle) => {
  const {
    fields: { firstPublicationDate },
    sectionName,
    frontsMeta: { tone }
  } = article;
  if (!isLive(article)) {
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

const FeedItem = ({ article, onAddToClipboard = noop }: FeedItemProps) => (
  <Container
    data-testid="feed-item"
    draggable={true}
    onDragStart={event => dragStart(article, event)}
  >
    <VisitedWrapper
      href={getPaths(article.id).live}
      onClick={e => e.preventDefault()}
      aria-disabled
    >
      <MetaContainer>
        <Tone
          style={{
            color:
              getPillarColor(
                article.pillarId,
                isLive(article),
                article.frontsMeta.tone === liveBlogTones.dead
              ) || styleTheme.capiInterface.textLight
          }}
        >
          {getArticleLabel(article)}
        </Tone>
        {article.fields.scheduledPublicationDate && (
          <ScheduledPublication>
            {distanceInWordsStrict(
              new Date(article.fields.scheduledPublicationDate),
              Date.now()
            )}
          </ScheduledPublication>
        )}
        {article.webPublicationDate && (
          <FirstPublished>
            {distanceInWordsStrict(
              Date.now(),
              new Date(article.webPublicationDate)
            )}
          </FirstPublished>
        )}
        <ShortVerticalPinline />
      </MetaContainer>
      <Body>
        <Title data-testid="headline">{article.webTitle}</Title>
      </Body>
      <ThumbnailSmall
        style={{
          backgroundImage: `url('${getThumbnail(
            article,
            article.frontsMeta.defaults
          )}')`
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
          isLive: isLive(article),
          urlPath: article.id,
          onAddToClipboard: () => onAddToClipboard(article)
        }}
        toolTipPosition={'top'}
        toolTipAlign={'right'}
      />
    </HoverActionsAreaOverlay>
  </Container>
);

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (article: CapiArticle) =>
      dispatch(
        insertArticleFragment(
          { type: 'clipboard', id: 'clipboard', index: 0 },
          { type: 'CAPI', data: article },
          'clipboard'
        )
      )
  };
};

export default connect(
  null,
  mapDispatchToProps
)(FeedItem);
