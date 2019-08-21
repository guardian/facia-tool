import React from 'react';
import { styled, theme as globalTheme } from 'constants/theme';
import { theme as styleTheme } from 'constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import BasePlaceholder from '../BasePlaceholder';
import { getPillarColor } from 'shared/util/getPillarColor';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import { notLiveLabels, liveBlogTones } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import { ThumbnailSmall, ThumbnailCutout } from '../image/Thumbnail';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import {
  HoverViewButton,
  HoverOphanButton,
  HoverDeleteButton,
  HoverAddToClipboardButton
} from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { CollectionItemSizes } from 'shared/types/Collection';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';
import CollectionItemDraftMetaContent from '../collectionItem/CollectionItemDraftMetaContent';
import DraggableArticleImageContainer from './DraggableArticleImageContainer';
import { media } from 'shared/util/mediaQueries';
import ArticleGraph from './ArticleGraph';
import { VideoIcon } from '../icons/Icons';
import CollectionItemHeadingContainer from '../collectionItem/CollectionItemHeadingContainer';
import CollectionItemSettingsDisplay from '../collectionItem/CollectionItemSettingsDisplay';
import CircularIconContainer from '../icons/CircularIconContainer';
import { ImageMetadataContainer } from '../image/ImageMetaDataContainer';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  flex-shrink: 0;
  width: 83px;
  height: 50px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: ${({ theme }) => theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: ${({ displaySize }) =>
    displaySize === 'small'
      ? globalTheme.shared.collectionItem.fontSizeSmall
      : globalTheme.shared.collectionItem.fontSizeDefault};
  ${media.large`font-size: 13px;`}
`;

const ArticleBodyByline = styled('div')`
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: ${styleTheme.shared.collectionItem.fontSizeDefault};
  font-style: italic;
  padding-top: 5px;
`;

const FirstPublicationDate = styled(CollectionItemMetaContent)`
  color: ${({ theme }) => theme.shared.colors.green};
`;

const PageViewDataWrapper = styled('div')`
  width: 45px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 5px;
  font-size: 12px;
  height: 35px;
  padding-bottom: 3px;
`;

const Tone = styled('span')`
  font-weight: normal;
`;

const ImageAndGraphWrapper = styled('div')<{ size: CollectionItemSizes }>`
  display: flex;
  flex-direction: row;
  ${props =>
    props.size === 'medium' &&
    `flex-wrap: wrap-reverse;
    justify-content: flex-end;`}
`;

const VideoIconContainer = styled(CircularIconContainer)`
  position: absolute;
  bottom: 2px;
  right: 2px;
`;

interface ArticleBodyProps {
  newspaperEditionDate?: string;
  firstPublicationDate?: string;
  frontPublicationDate?: number;
  scheduledPublicationDate?: string;
  pillarId?: string;
  kicker?: string;
  size?: CollectionItemSizes;
  textSize?: CollectionItemSizes;
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
    frontId
  }: ArticleBodyProps) => {
    const displayByline = size === 'default' && showByline && byline;
    const now = Date.now();

    return (
      <>
        {showMeta && (
          <CollectionItemMetaContainer size={size}>
            {displayPlaceholders && (
              <>
                <TextPlaceholder data-testid="loading-placeholder" />
                {size !== 'small' && <TextPlaceholder width={25} />}
              </>
            )}
            {!displayPlaceholders && size !== 'small' && isLive && (
              <CollectionItemMetaHeading
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
              </CollectionItemMetaHeading>
            )}
            {type === 'liveblog' && (
              <CollectionItemMetaContent>Liveblog</CollectionItemMetaContent>
            )}
            {!isLive && !displayPlaceholders && (
              <NotLiveContainer>
                {firstPublicationDate
                  ? notLiveLabels.takenDown
                  : notLiveLabels.draft}
              </NotLiveContainer>
            )}
            {!!scheduledPublicationDate && !firstPublicationDate && (
              <CollectionItemDraftMetaContent title="The time until this article is scheduled to be published.">
                {distanceInWordsStrict(new Date(scheduledPublicationDate), now)}
              </CollectionItemDraftMetaContent>
            )}
            {!!frontPublicationDate && (
              <CollectionItemMetaContent title="The time elapsed since this card was created in the tool.">
                {distanceInWordsStrict(now, new Date(frontPublicationDate))}
              </CollectionItemMetaContent>
            )}
            {!!firstPublicationDate && (
              <FirstPublicationDate title="The time elapsed since this article was first published.">
                {distanceInWordsStrict(new Date(firstPublicationDate), now)}
              </FirstPublicationDate>
            )}
          </CollectionItemMetaContainer>
        )}
        <CollectionItemContent displaySize={size} textSize={textSize}>
          <CollectionItemSettingsDisplay
            isBreaking={isBreaking}
            showByline={showByline}
            showQuotedHeadline={showQuotedHeadline}
            showLargeHeadline={showLargeHeadline}
            isBoosted={isBoosted}
          />
          <CollectionItemHeadingContainer size={size}>
            {displayPlaceholders && (
              <>
                <TextPlaceholder />
                {size !== 'small' && <TextPlaceholder width={25} />}
              </>
            )}
            {kicker && (
              <KickerHeading
                displaySize={size}
                style={{ color: getPillarColor(pillarId, true) }}
                data-testid="kicker"
              >
                {`${kicker} `}
              </KickerHeading>
            )}
            <CollectionItemHeading
              html
              data-testid="headline"
              displaySize={size}
            >
              {headline}
            </CollectionItemHeading>
            {displayByline && <ArticleBodyByline>{byline}</ArticleBodyByline>}
          </CollectionItemHeadingContainer>
        </CollectionItemContent>
        <ImageAndGraphWrapper size={size}>
          {featureFlagPageViewData && canShowPageViewData && (
            <PageViewDataWrapper data-testid="page-view-graph">
              <ArticleGraph articleId={uuid} frontId={frontId} />
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
