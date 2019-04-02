import React from 'react';
import { styled } from 'shared/constants/theme';
import startCase from 'lodash/startCase';
import distanceInWordsStrict from 'date-fns/distance_in_words_strict';
import { MdCollections } from 'react-icons/md';

import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import BasePlaceholder from '../BasePlaceholder';
import { getPillarColor } from 'shared/util/getPillarColor';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import { notLiveLabels } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import Thumbnail from '../Thumbnail';
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
import CollectionItemTrail from '../collectionItem/CollectionItemTrail';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';
import CollectionItemDraftMetaContent from '../collectionItem/CollectionItemDraftMetaContent';
import CollectionItemNotification from '../collectionItem/CollectionItemNotification';
import ColouredQuote from '../collectionItem/CollectionItemQuote';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 130px;
  height: 83px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: ${({ theme }) => theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: GHGuardianHeadline;
  font-weight: bold;
  padding-right: 3px;
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

const ArticleSlideshow = styled('div')`
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

const SlideshowIcon = styled('div')`
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
  frontPublicationTime?: string;
  firstPublicationDate?: string;
  scheduledPublicationDate?: string;
  pillarId?: string;
  kicker?: string;
  size?: CollectionItemSizes;
  headline?: string;
  trailText?: string;
  thumbnail?: string | void;
  isLive?: boolean;
  urlPath?: string;
  sectionName?: string;
  displayPlaceholders?: boolean;
  uuid: string;
  onDelete?: (id: string) => void;
  onAddToClipboard?: (id: string) => void;
  notifications?: string[];
  isUneditable?: boolean;
  byline?: string;
  showByline?: boolean;
  showQuotedHeadline?: boolean;
  imageHide?: boolean;
  imageSlideshowReplace?: boolean;
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
  scheduledPublicationDate,
  sectionName,
  pillarId,
  kicker,
  size = 'default',
  headline,
  trailText,
  thumbnail,
  isLive,
  urlPath,
  displayPlaceholders,
  onDelete,
  onAddToClipboard,
  notifications,
  isUneditable,
  frontPublicationTime,
  byline,
  showByline,
  showQuotedHeadline,
  imageHide,
  imageSlideshowReplace,
  isBreaking,
  type
}: ArticleBodyProps) => {
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
  const displayByline = size === 'default' && showByline && byline;
  const displayTrail =
    size === 'default' && trailText && !(showByline && byline);
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
        {scheduledPublicationDate && !firstPublicationDate && (
          <CollectionItemDraftMetaContent title="The time until this article is scheduled to be published.">
            {distanceInWordsStrict(new Date(scheduledPublicationDate), now)}
          </CollectionItemDraftMetaContent>
        )}
        {frontPublicationTime && (
          <CollectionItemMetaContent title="The time elapsed since this article was added to this front.">
            {distanceInWordsStrict(now, new Date(frontPublicationTime))}
          </CollectionItemMetaContent>
        )}
        {size === 'default' && firstPublicationDate && (
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
            <KickerHeading style={{ color: getPillarColor(pillarId, true) }}>
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
        {displayTrail && (
          <CollectionItemTrail html>{trailText}</CollectionItemTrail>
        )}
        {displayByline && <ArticleBodyByline>{byline}</ArticleBodyByline>}
      </CollectionItemContent>
      {size === 'default' &&
        (displayPlaceholders ? (
          <ThumbnailPlaceholder />
        ) : (
          <div>
            {imageSlideshowReplace && (
              <ArticleSlideshow>
                <SlideshowIcon>
                  <MdCollections />
                </SlideshowIcon>
              </ArticleSlideshow>
            )}
            <Thumbnail
              style={{
                backgroundImage: `url('${thumbnail}')`,
                opacity: imageHide ? 0.5 : 1
              }}
            />
          </div>
        ))}
      {notifications && (
        <CollectionItemNotification>
          {notifications.map(notification => (
            <span key={notification}>{notification} </span>
          ))}
        </CollectionItemNotification>
      )}
      <HoverActionsAreaOverlay disabled={isUneditable}>
        <HoverActionsButtonWrapper
          buttons={[
            { text: 'View', component: HoverViewButton },
            { text: 'Ophan', component: HoverOphanButton }
          ]}
          buttonProps={{
            isLive,
            urlPath,
            onDelete
          }}
          size={size}
          toolTipPosition={'top'}
          toolTipAlign={'left'}
        />
        <HoverActionsButtonWrapper
          buttons={[
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
          toolTipAlign={'right'}
        />
      </HoverActionsAreaOverlay>
    </>
  );
};

export { ArticleBodyProps };

export default articleBodyDefault;
