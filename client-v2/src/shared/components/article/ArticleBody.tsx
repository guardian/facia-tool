import React from 'react';
import { styled, theme as globalTheme, theme } from 'constants/theme';
import { theme as styleTheme } from 'constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import CardHeading from '../card/CardHeading';
import BasePlaceholder from '../BasePlaceholder';
import { getPillarColor } from 'shared/util/getPillarColor';
import CardMetaContainer from '../card/CardMetaContainer';
import CardContent from '../card/CardContent';
import { notLiveLabels, liveBlogTones } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import { ThumbnailSmall, ThumbnailCutout } from '../image/Thumbnail';
import CardMetaHeading from '../card/CardMetaHeading';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import {
  HoverViewButton,
  HoverOphanButton,
  HoverDeleteButton,
  HoverAddToClipboardButton
} from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { CardSizes } from 'shared/types/Collection';
import CardMetaContent from '../card/CardMetaContent';
import CardDraftMetaContent from '../card/CardDraftMetaContent';
import DraggableArticleImageContainer from './DraggableArticleImageContainer';
import { media } from 'shared/util/mediaQueries';
import ArticleGraph from './ArticleGraph';
import { VideoIcon } from '../icons/Icons';
import CardHeadingContainer from '../card/CardHeadingContainer';
import CardSettingsDisplay from '../card/CardSettingsDisplay';
import CircularIconContainer from '../icons/CircularIconContainer';
import { ImageMetadataContainer } from '../image/ImageMetaDataContainer';
import EditModeVisibility from 'components/util/EditModeVisibility';
import PageViewDataWrapper from '../PageViewDataWrapper';
import ImageAndGraphWrapper from '../image/ImageAndGraphWrapper';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  flex-shrink: 0;
  width: 83px;
  height: 50px;
`;

const NotLiveContainer = styled(CardMetaHeading)`
  color: ${theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CardHeading)<{ pillarId?: string }>`
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: ${({ displaySize }) =>
    displaySize === 'small'
      ? globalTheme.shared.card.fontSizeSmall
      : globalTheme.shared.card.fontSizeDefault};
  ${media.large`font-size: 13px;`}
  color: ${({ pillarId }) => getPillarColor(pillarId, true)};
`;

const ArticleBodyByline = styled.div`
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: ${styleTheme.shared.card.fontSizeDefault};
  font-style: italic;
  padding-top: 5px;
`;

const FirstPublicationDate = styled(CardMetaContent)`
  color: ${theme.shared.colors.green};
`;

const Tone = styled.span`
  font-weight: normal;
`;

const VideoIconContainer = styled(CircularIconContainer)`
  position: absolute;
  bottom: 2px;
  right: 2px;
`;

interface ArticleBodyProps {
  newspaperPageNumber?: number;

  promotionMetric?: number;

  newspaperEditionDate?: string;
  firstPublicationDate?: string;
  frontPublicationDate?: number;
  scheduledPublicationDate?: string;
  pillarId?: string;
  kicker?: string;
  size?: CardSizes;
  textSize?: CardSizes;
  headline?: string;
  thumbnail?: string | void;
  cutoutThumbnail?: string | void;
  isLive?: boolean;
  urlPath?: string;
  sectionName?: string;
  displayPlaceholders?: boolean;
  uuid: string;
  onDelete?: () => void;
  onAddToClipboard?: () => void;
  isUneditable?: boolean;
  byline?: string;
  showByline?: boolean;
  showQuotedHeadline?: boolean;
  imageHide?: boolean;
  imageSlideshowReplace?: boolean;
  imageReplace?: boolean;
  imageCutoutReplace?: boolean;
  isBreaking?: boolean;
  type?: string;
  showLargeHeadline?: boolean;
  showMeta?: boolean;
  canDragImage?: boolean;
  isDraggingImageOver: boolean;
  isBoosted?: boolean;
  hasMainVideo?: boolean;
  showMainVideo?: boolean;
  tone?: string | undefined;
  featureFlagPageViewData?: boolean;
  canShowPageViewData: boolean;
  frontId: string;
  collectionId?: string;
}

const articleBodyDefault = React.memo(
  ({
    firstPublicationDate,
    frontPublicationDate,
    scheduledPublicationDate,
    sectionName,
    pillarId,
    kicker,
    size = 'default',
    textSize,
    headline,
    thumbnail,
    cutoutThumbnail,
    isLive,
    urlPath,
    displayPlaceholders,
    onDelete,
    onAddToClipboard,
    isUneditable,
    byline,
    showByline,
    showQuotedHeadline,
    imageHide,
    imageSlideshowReplace,
    imageReplace,
    imageCutoutReplace,
    isBreaking,
    type,
    uuid,
    showLargeHeadline,
    showMeta = true,
    canDragImage = true,
    isDraggingImageOver,
    isBoosted,
    tone,
    featureFlagPageViewData,
    canShowPageViewData,
    hasMainVideo,
    showMainVideo,
    frontId,
    collectionId,
    newspaperPageNumber,
    promotionMetric
  }: ArticleBodyProps) => {
    const displayByline = size === 'default' && showByline && byline;
    const now = Date.now();

    return (
      <>
        {showMeta && (
          <CardMetaContainer size={size}>
            {displayPlaceholders && (
              <>
                <TextPlaceholder data-testid="loading-placeholder" />
                {size !== 'small' && <TextPlaceholder width={25} />}
              </>
            )}
            {!displayPlaceholders && size !== 'small' && isLive && (
              <CardMetaHeading
                style={{
                  color: getPillarColor(
                    pillarId,
                    isLive,
                    tone === liveBlogTones.dead
                  )
                }}
              >
                {startCase(sectionName)}
                <Tone> / {startCase(tone)}</Tone>
              </CardMetaHeading>
            )}
            {type === 'liveblog' && <CardMetaContent>Liveblog</CardMetaContent>}
            {!isLive && !displayPlaceholders && (
              <NotLiveContainer>
                {firstPublicationDate
                  ? notLiveLabels.takenDown
                  : notLiveLabels.draft}
              </NotLiveContainer>
            )}
            {!!scheduledPublicationDate && !firstPublicationDate && (
              <CardDraftMetaContent title="The time until this article is scheduled to be published.">
                {distanceInWordsStrict(new Date(scheduledPublicationDate), now)}
              </CardDraftMetaContent>
            )}
            <EditModeVisibility visibleMode="editions">
              {!promotionMetric && !!newspaperPageNumber && (
                <CardMetaContent title="The newspaper page number of this article">
                  Page {newspaperPageNumber}
                </CardMetaContent>
              )}
            </EditModeVisibility>
            <EditModeVisibility visibleMode="editions">
              {!!promotionMetric && (
                <CardMetaContent title="The newspaper page number of this article">
                  Promotion {Math.floor(promotionMetric)}
                </CardMetaContent>
              )}
            </EditModeVisibility>
            {!!frontPublicationDate && (
              <CardMetaContent title="The time elapsed since this card was created in the tool.">
                {distanceInWordsStrict(now, new Date(frontPublicationDate))}
              </CardMetaContent>
            )}
            {!!firstPublicationDate && (
              <FirstPublicationDate title="The time elapsed since this article was first published.">
                {distanceInWordsStrict(new Date(firstPublicationDate), now)}
              </FirstPublicationDate>
            )}
          </CardMetaContainer>
        )}
        <CardContent displaySize={size} textSize={textSize}>
          <CardSettingsDisplay
            isBreaking={isBreaking}
            showByline={showByline}
            showQuotedHeadline={showQuotedHeadline}
            showLargeHeadline={showLargeHeadline}
            isBoosted={isBoosted}
          />
          <CardHeadingContainer size={size}>
            {displayPlaceholders && (
              <>
                <TextPlaceholder />
                {size !== 'small' && <TextPlaceholder width={25} />}
              </>
            )}
            {kicker && (
              <KickerHeading
                displaySize={size}
                pillarId={pillarId}
                data-testid="kicker"
              >
                {`${kicker} `}
              </KickerHeading>
            )}
            <CardHeading html data-testid="headline" displaySize={size}>
              {headline}
            </CardHeading>
            {displayByline && <ArticleBodyByline>{byline}</ArticleBodyByline>}
          </CardHeadingContainer>
        </CardContent>
        <ImageAndGraphWrapper size={size}>
          {featureFlagPageViewData && canShowPageViewData && collectionId && (
            <PageViewDataWrapper data-testid="page-view-graph">
              <ArticleGraph
                articleId={uuid}
                collectionId={collectionId}
                frontId={frontId}
              />
            </PageViewDataWrapper>
          )}

          {size !== 'small' &&
            (displayPlaceholders ? (
              <ThumbnailPlaceholder />
            ) : (
              <DraggableArticleImageContainer id={uuid} canDrag={canDragImage}>
                <ThumbnailSmall
                  imageHide={imageHide}
                  url={thumbnail}
                  isDraggingImageOver={isDraggingImageOver}
                >
                  {cutoutThumbnail ? (
                    <ThumbnailCutout src={cutoutThumbnail} />
                  ) : null}
                  {hasMainVideo && (
                    <VideoIconContainer title="This media has video content.">
                      <VideoIcon />
                    </VideoIconContainer>
                  )}
                </ThumbnailSmall>
                <ImageMetadataContainer
                  imageSlideshowReplace={imageSlideshowReplace}
                  imageReplace={imageReplace}
                  imageCutoutReplace={imageCutoutReplace}
                  showMainVideo={showMainVideo}
                />
              </DraggableArticleImageContainer>
            ))}
        </ImageAndGraphWrapper>
        <HoverActionsAreaOverlay disabled={isUneditable}>
          <HoverActionsButtonWrapper
            buttons={[
              { text: 'View', component: HoverViewButton },
              { text: 'Ophan', component: HoverOphanButton },
              { text: 'Clipboard', component: HoverAddToClipboardButton },
              { text: 'Delete', component: HoverDeleteButton }
            ]}
            buttonProps={{
              isLive,
              urlPath,
              onDelete,
              onAddToClipboard
            }}
            size={size}
            toolTipPosition={'top'}
            toolTipAlign={'left'}
          />
        </HoverActionsAreaOverlay>
      </>
    );
  }
);

export { ArticleBodyProps };

export default articleBodyDefault;
