import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import { styled, theme } from 'constants/theme';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import startCase from 'lodash/startCase';

import { selectArticleAcrossResources } from 'bundles/capiFeedBundle';
import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import { getPillarColor, notLiveColour } from 'shared/util/getPillarColor';
import { HoverActionsAreaOverlay } from 'shared/components/CollectionHoverItems';
import { HoverActionsButtonWrapper } from 'shared/components/input/HoverActionButtonWrapper';
import {
  HoverViewButton,
  HoverOphanButton,
  HoverAddToClipboardButton
} from 'shared/components/input/HoverActionButtons';
import { selectFeatureValue } from 'redux/modules/featureSwitches/selectors';
import { insertCardWithCreate } from 'actions/Cards';
import noop from 'lodash/noop';
import { getPaths } from 'util/paths';
import { ThumbnailSmall } from 'shared/components/image/Thumbnail';
import { CapiArticle } from 'types/Capi';
import { getThumbnail, getArticleLabel, isLive } from 'util/CAPIUtils';
import {
  DraggingArticleComponent,
  dragOffsetX,
  dragOffsetY
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import { media } from 'shared/util/mediaQueries';
import { State } from 'types/State';
import { liveBlogTones } from 'constants/fronts';
import { hasMainVideo } from 'shared/util/externalArticle';
import { VideoIcon } from 'shared/components/icons/Icons';
import CircularIconContainer from 'shared/components/icons/CircularIconContainer';
import RefreshPeriodically from '../util/RefreshPeriodically';
import { collectionArticlesPollInterval } from 'constants/polling';
import RenderOffscreen from 'components/util/RenderOffscreen';
import ArticlePageNumberSection from '../util/ArticlePageNumberSection';

const Container = styled.div`
  display: flex;
  position: relative;
  border-top: ${`1px solid ${theme.capiInterface.borderLight}`};
  color: ${theme.capiInterface.feedItemText};
  display: flex;
  font-weight: normal;
  padding-bottom: 20px;
  cursor: pointer;

  ${HoverActionsAreaOverlay} {
    bottom: 5px;
    position: absolute;
    visibility: hidden;
  }

  :hover ${HoverActionsAreaOverlay} {
    visibility: visible;
  }
`;

const Title = styled.h2`
  margin: 2px 0 0;
  vertical-align: top;
  font-family: TS3TextSans;
  font-size: ${theme.card.fontSizeDefault};
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
    color: ${theme.capiInterface.textVisited};
  }
  ${({ blur }) => blur && 'filter: blur(10px);'}
`;

const MetaContainer = styled.div`
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

const FirstPublished = styled.div`
  font-size: 11px;
  margin: 2px 0;
`;

const ScheduledPublication = styled(FirstPublished)`
  color: ${notLiveColour};
`;

const TagInfo = styled.div`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans;
  font-weight: bold;
`;

const Tone = styled.span`
  font-weight: normal;
`;

const Body = styled.div`
  padding-left: 8px;
`;

const VideoIconContainer = styled(CircularIconContainer)`
  position: absolute;
  bottom: 2px;
  right: 2px;
`;

interface ContainerProps {
  id: string;
}

interface ComponentProps extends ContainerProps {
  article?: CapiArticle;
  shouldObscureFeed: boolean;
  onAddToClipboard: (article: CapiArticle) => void;
}

class FeedItem extends React.Component<ComponentProps> {
  private dragNode: React.RefObject<HTMLDivElement>;
  public constructor(props: ComponentProps) {
    super(props);
    this.dragNode = React.createRef();
  }
  public render() {
    const {
      id,
      article,
      onAddToClipboard = noop,
      shouldObscureFeed
    } = this.props;
    if (!article) {
      return <p>Article with id {id} not found.</p>;
    }
    return (
      <Container
        data-testid="feed-item"
        draggable={true}
        onDragStart={this.handleDragStart}
      >
        <RenderOffscreen ref={this.dragNode}>
          <DraggingArticleComponent headline={article.webTitle} />
        </RenderOffscreen>
        <FeedItemContainer
          href={getPaths(article.id).live}
          onClick={e => e.preventDefault()}
          aria-disabled
          blur={shouldObscureFeed}
        >
          <MetaContainer>
            <TagInfo
              style={{
                color:
                  getPillarColor(
                    article.pillarId,
                    isLive(article),
                    article.frontsMeta.tone === liveBlogTones.dead
                  ) || theme.capiInterface.textLight
              }}
            >
              {getArticleLabel(article)}
              {article.frontsMeta.tone && (
                <Tone> / {startCase(article.frontsMeta.tone)}</Tone>
              )}
            </TagInfo>
            <ArticlePageNumberSection article={article} />
            <RefreshPeriodically rateMs={collectionArticlesPollInterval}>
              {() => (
                <>
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
                </>
              )}
            </RefreshPeriodically>
            <ShortVerticalPinline />
          </MetaContainer>
          <Body>
            <Title data-testid="headline">{article.webTitle}</Title>
          </Body>
          <ArticleThumbnail
            style={{
              backgroundImage: `url('${getThumbnail(
                article.frontsMeta.defaults,
                article
              )}')`
            }}
          >
            {hasMainVideo(article) && (
              <VideoIconContainer title="This media has video content.">
                <VideoIcon />
              </VideoIconContainer>
            )}
          </ArticleThumbnail>
        </FeedItemContainer>
        <HoverActionsAreaOverlay data-testid="hover-overlay">
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

const getState = (state: any) => state;

const mapStateToProps = (state: State, { id }: ContainerProps) => ({
  shouldObscureFeed: selectFeatureValue(getState(state), 'obscure-feed'),
  article: selectArticleAcrossResources(state, id)
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (article: CapiArticle) =>
      dispatch(
        insertCardWithCreate(
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
