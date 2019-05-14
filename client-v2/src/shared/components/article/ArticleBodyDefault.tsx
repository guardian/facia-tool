import React from 'react';
import { styled } from 'shared/constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import { MdCollections, MdImage } from 'react-icons/md';

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

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 83px;
  height: 50px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: ${({ theme }) => theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: GHGuardianHeadline;
  font-weight: bold;
  padding-right: 3px;
  font-size: ${({ displaySize }) =>
    displaySize === 'small' ? '13px' : '15px'};
`;

const ArticleHeadingContainerSmall = styled('div')`
  width: 100%;
`;

const ArticleBodyByline = styled('div')`
  font-style: italic;
  padding-top: 5px;
`;

const ArticleBodyQuoteContainer = styled('span')`
  margin-right: 0.1rem;
`;

const ImageOverrideContainer = styled('div')`
  position: absolute;
  background: ${({ theme }) => theme.shared.colors.white};
  width: 24px;
  height: 24px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  vertical-align: middle;
  top: 2px;
  right: 2px;
`;

const ImageOverrideIcon = styled('div')`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 14px;
  height: 14px;
`;

const FirstPublicationDate = styled(CollectionItemMetaContent)`
  color: ${({ theme }) => theme.shared.colors.green};
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
  onDelete?: (id: string) => void;
  onAddToClipboard?: (id: string) => void;
  isUneditable?: boolean;
  byline?: string;
  showByline?: boolean;
  showQuotedHeadline?: boolean;
  imageHide?: boolean;
  imageSlideshowReplace?: boolean;
  imageReplace?: boolean;
  isBreaking?: boolean;
  type?: string;
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

const articleBodyDefault = ({
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
  isBreaking,
  type,
  uuid
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
            >
              {kickerToDisplay}
            </KickerHeading>
          )}
          {showQuotedHeadline && (
            <ArticleBodyQuoteContainer>
              {renderColouredQuotes(size, pillarId, isLive)}
            </ArticleBodyQuoteContainer>
          )}
          <CollectionItemHeading html data-testid="headline" displaySize={size}>
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
            {imageSlideshowReplace && (
              <ImageOverrideContainer title="This article has a slideshow override">
                <ImageOverrideIcon>
                  <MdCollections />
                </ImageOverrideIcon>
              </ImageOverrideContainer>
            )}
            {imageReplace && (
              <ImageOverrideContainer title="This article has an image override">
                <ImageOverrideIcon>
                  <MdImage />
                </ImageOverrideIcon>
              </ImageOverrideContainer>
            )}
            <ThumbnailSmall
              style={{
                backgroundImage: `url('${thumbnail}')`,
                opacity: imageHide ? 0.5 : 1
              }}
            />
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
            onDelete: () => onDelete && onDelete(uuid),
            onAddToClipboard: () => onAddToClipboard && onAddToClipboard(uuid)
          }}
          size={size}
          toolTipPosition={'top'}
          toolTipAlign={'left'}
        />
      </HoverActionsAreaOverlay>
    </>
  );
};

export { ArticleBodyProps };

export default articleBodyDefault;
