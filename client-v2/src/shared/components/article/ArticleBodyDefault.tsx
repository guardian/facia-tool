import React from 'react';
import { styled } from 'shared/constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import BasePlaceholder from '../BasePlaceholder';
import { getPillarColor } from 'shared/util/getPillarColor';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import { notLiveLabels } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import { ThumbnailSmall } from '../Thumbnail';
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
import ColouredQuote from '../collectionItem/CollectionItemQuote';
import DraggableArticleImageContainer from './DraggableArticleImageContainer';
import { media } from 'shared/util/mediaQueries';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 83px;
  height: 50px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: ${({ theme }) => theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: TS3TextSans;
  font-weight: 500;
  padding-right: 3px;
  font-size: ${({ displaySize }) =>
    displaySize === 'small' ? '13px' : '15px'};
  ${media.large`font-size: 13px;`}
`;

const ArticleHeadingContainerSmall = styled('div')`
  width: 100%;
`;

const ArticleBodyByline = styled('div')`
  font-family: TS3TextSans;
  font-weight: 500;
  font-size: 15px;
  font-style: italic;
  padding-top: 5px;
`;

const ArticleBodyQuoteContainer = styled('span')`
  margin-right: 0.1rem;
`;

const FirstPublicationDate = styled(CollectionItemMetaContent)`
  color: ${({ theme }) => theme.shared.colors.green};
`;

const ImageMetadataContainer = styled('div')`
  font-size: 10px;
  background-color: ${({ theme }) => theme.shared.colors.whiteLight};
`;

interface ArticleBodyProps {
  firstPublicationDate?: string;
  frontPublicationDate?: number;
  scheduledPublicationDate?: string;
  pillarId?: string;
  kicker?: string;
  size?: CollectionItemSizes;
  headline?: string;
  thumbnail?: string | void;
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
  showBoostedHeadline?: boolean;
}

const renderColouredQuotes = (
  size?: 'small' | 'default',
  pillarId?: string,
  isLive?: boolean
) => {
  const pillarColour = getPillarColor(pillarId, isLive || true);
  const height = size === 'small' ? '12px' : '18px';
  return (
    <React.Fragment>
      <ColouredQuote colour={pillarColour} height={height} />
      <ColouredQuote colour={pillarColour} height={height} />
    </React.Fragment>
  );
};

const articleBodyDefault = React.memo(
  ({
    firstPublicationDate,
    frontPublicationDate,
    scheduledPublicationDate,
    sectionName,
    pillarId,
    kicker,
    size = 'default',
    headline,
    thumbnail,
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
    showBoostedHeadline
  }: ArticleBodyProps) => {
    const ArticleHeadingContainer =
      size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
    const displayByline = size === 'default' && showByline && byline;
    const kickerToDisplay = isBreaking ? 'Breaking news' : kicker;
    const now = Date.now();

    return (
      <>
        <CollectionItemMetaContainer>
          {displayPlaceholders && (
            <>
              <TextPlaceholder data-testid="loading-placeholder" />
              {size === 'default' && <TextPlaceholder width={25} />}
            </>
          )}
          {size === 'default' && isLive && (
            <CollectionItemMetaHeading>
              {startCase(sectionName)}
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
            <CollectionItemMetaContent title="The time elapsed since this article was added to this front.">
              {distanceInWordsStrict(now, new Date(frontPublicationDate))}
            </CollectionItemMetaContent>
          )}
          {!!firstPublicationDate && (
            <FirstPublicationDate title="The time elapsed since this article was first published.">
              {distanceInWordsStrict(new Date(firstPublicationDate), now)}
            </FirstPublicationDate>
          )}
        </CollectionItemMetaContainer>
        <CollectionItemContent displaySize={size}>
          <ArticleHeadingContainer>
            {displayPlaceholders && (
              <>
                <TextPlaceholder />
                {size === 'default' && <TextPlaceholder width={25} />}
              </>
            )}
            {kickerToDisplay && (
              <KickerHeading
                displaySize={size}
                style={{ color: getPillarColor(pillarId, true) }}
                data-testid="kicker"
              >
                {kickerToDisplay}
              </KickerHeading>
            )}
            {showQuotedHeadline && (
              <ArticleBodyQuoteContainer>
                {renderColouredQuotes(size, pillarId, isLive)}
              </ArticleBodyQuoteContainer>
            )}
            <CollectionItemHeading
              html
              data-testid="headline"
              displaySize={size}
              showBoostedHeadline={showBoostedHeadline}
            >
              {headline}
            </CollectionItemHeading>
          </ArticleHeadingContainer>
          {displayByline && <ArticleBodyByline>{byline}</ArticleBodyByline>}
        </CollectionItemContent>
        {size === 'default' &&
          (displayPlaceholders ? (
            <ThumbnailPlaceholder />
          ) : (
            <DraggableArticleImageContainer id={uuid}>
              <ThumbnailSmall
                style={{
                  backgroundImage: `url('${thumbnail}')`,
                  opacity: imageHide ? 0.5 : 1
                }}
              />
              <ImageMetadataContainer>
                {imageSlideshowReplace && 'Slideshow'}
                {imageReplace && 'Image replaced'}
                {imageCutoutReplace && 'Cutout replaced'}
              </ImageMetadataContainer>
            </DraggableArticleImageContainer>
          ))}
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
