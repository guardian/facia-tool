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
import { selectFeatureValue } from 'shared/redux/modules/featureSwitches/selectors';
import { insertArticleFragment } from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import { getPaths } from 'util/paths';
import { liveBlogTones } from 'constants/fronts';
import { ThumbnailSmall } from 'shared/components/Thumbnail';
import { CapiArticle } from 'types/Capi';
import { getThumbnail } from 'util/CAPIUtils';
import {
  DraggingArticleComponent,
  dragOffsetX,
  dragOffsetY
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import { media } from 'shared/util/mediaQueries';
import { State } from 'types/State';
import { selectSharedState } from 'shared/selectors/shared';

const Container = styled('div')`
  display: flex;
  position: relative;
  border-top: ${({ theme }) => `1px solid ${theme.capiInterface.borderLight}`};
  color: ${({ theme }) => theme.capiInterface.feedItemText};
  display: flex;
  font-weight: normal;
  padding-bottom: 20px;
  cursor: pointer;

  ${HoverActionsAreaOverlay} {
    bottom: 5px;
    right: 4px;
    position: absolute;
    visibility: hidden;
  }

  :hover ${HoverActionsAreaOverlay} {
    visibility: visible;
  }
`;

const Title = styled(`h2`)`
  margin: 2px 0 0;
  vertical-align: top;
  font-family: TS3TextSans;
  font-size: ${styleTheme.shared.collectionItem.fontSizeDefault};
  ${media.large`font-size: 13px;`}
  font-weight: normal;
`;

const FeedItemContainer = styled.a<{ blur: boolean }>`
  text-decoration: none;
  display: flex;
  color: inherit;
  width: 100%;
  height: 100%;
  :visited ${Title} {
    color: ${({ theme }) => theme.capiInterface.textVisited};
  }
  ${({ blur }) => blur && 'filter: blur(10px);'}
`;

const MetaContainer = styled('div')`
  position: relative;
  width: 80px;
  ${media.large`width: 60px;`};
  flex-shrink: 0;
  padding: 0px 2px;
  word-break: word;
  hyphens: auto;
`;

const ArticleThumbnail = styled(ThumbnailSmall)`
  margin-left: auto;
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

// The visual representation of an article as it is being dragged.
// This needs to be rendered by the DOM before it can be used by the Drag&Drop API, so we pushed it off to the side.
const DraggingArticleContainer = styled('div')`
  position: absolute;
  transform: translateX(-9999px);
`;

interface FeedItemProps {
  article: CapiArticle;
  shouldObscureFeed: boolean;
  onAddToClipboard: (article: CapiArticle) => void;
}

// The content API drops the isLive flag on live CAPI endpoint, but keeps it in draft and print-sent.
// We need to assume that if the isLive flag isn't present then it's because we're hitting the live endpoint
// this makes the query to CAPI quite fragile. If anyone ever removes isLive from show-fields in the draft
// endpoint then we'll assume *all* content is live.
const isLive = (article: CapiArticle) =>
  article.fields.isLive === undefined ||
  article.fields.isLive === 'true' ||
  article.fields.isLive === true;

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

class FeedItem extends React.Component<FeedItemProps> {
  private dragNode: React.RefObject<HTMLDivElement>;
  public constructor(props: FeedItemProps) {
    super(props);
    this.dragNode = React.createRef();
  }
  public render() {
    const { article, onAddToClipboard = noop, shouldObscureFeed } = this.props;
    return (
      <Container
        data-testid="feed-item"
        draggable={true}
        onDragStart={this.handleDragStart}
      >
        <DraggingArticleContainer innerRef={this.dragNode}>
          <DraggingArticleComponent headline={article.webTitle} />
        </DraggingArticleContainer>

        <FeedItemContainer
          href={getPaths(article.id).live}
          onClick={e => e.preventDefault()}
          aria-disabled
          blur={shouldObscureFeed}
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
          <ArticleThumbnail
            style={{
              backgroundImage: `url('${getThumbnail(
                article,
                article.frontsMeta.defaults
              )}')`
            }}
          />
        </FeedItemContainer>
        <HoverActionsAreaOverlay justify="flex-end" data-testid="hover-overlay">
          <HoverActionsButtonWrapper
            buttons={[
              { text: 'View', component: HoverViewButton },
              { text: 'Ophan', component: HoverOphanButton },
              { text: 'Clipboard', component: HoverAddToClipboardButton }
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
  }

  private handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('capi', JSON.stringify(this.props.article));
    if (this.dragNode.current) {
      event.dataTransfer.setDragImage(
        this.dragNode.current,
        dragOffsetX,
        dragOffsetY
      );
    }
  };
}

const mapStateToProps = (state: State) => ({
  shouldObscureFeed: selectFeatureValue(
    selectSharedState(state),
    'obscure-feed'
  )
});

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
  mapStateToProps,
  mapDispatchToProps
)(FeedItem);
