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
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from '../CollectionHoverItems';
import { CollectionItemSizes } from 'shared/types/Collection';
import CollectionItemTrail from '../collectionItem/CollectionItemTrail';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';
import CollectionItemDraftMetaContent from '../collectionItem/CollectionItemDraftMetaContent';
import CollectionItemNotification from '../collectionItem/CollectionItemNotification';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 130px;
  height: 83px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: ${({ theme }) => theme.shared.base.colors.highlightColor};
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: GHGuardianHeadline-Bold;
  padding-right: 3px;
`;

const ArticleHeadingSmall = styled(CollectionItemHeading)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArticleHeadingContainerSmall = styled('div')`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArticleBodyByline = styled('div')`
  font-style: italic;
  padding-top: 5px;
`;

const ArticleBodyQuote = styled('span')`
  font-family: GHGuardianHeadline;
  font-size: 20px;
  font-weight: bold;
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
}

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
  imageSlideshowReplace
}: ArticleBodyProps) => {
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;

  const displayByline = size === 'default' && showByline && byline;
  const displayTrail =
    size === 'default' && trailText && !(showByline && byline);

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
        {!isLive && !displayPlaceholders && (
          <NotLiveContainer>
            {firstPublicationDate
              ? notLiveLabels.takenDown
              : notLiveLabels.draft}
          </NotLiveContainer>
        )}

        {scheduledPublicationDate && (
          <CollectionItemDraftMetaContent>
            {distanceInWordsStrict(
              new Date(scheduledPublicationDate),
              Date.now()
            )}
          </CollectionItemDraftMetaContent>
        )}

        {size === 'default' && frontPublicationTime && (
          <CollectionItemMetaContent>
            {distanceInWordsStrict(Date.now(), new Date(frontPublicationTime))}
          </CollectionItemMetaContent>
        )}
      </CollectionItemMetaContainer>
      <CollectionItemContent>
        <ArticleHeadingContainer>
          {displayPlaceholders && (
            <>
              <TextPlaceholder />
              {size === 'default' && <TextPlaceholder width={25} />}
            </>
          )}
          {kicker && (
            <KickerHeading style={{ color: getPillarColor(pillarId, true) }}>
              {kicker}
            </KickerHeading>
          )}
          {showQuotedHeadline && <ArticleBodyQuote>&quot;</ArticleBodyQuote>}
          {size === 'default' ? (
            <CollectionItemHeading html data-testid="headline">
              {headline}
            </CollectionItemHeading>
          ) : (
            <ArticleHeadingSmall html data-testid="headline">
              {headline}
            </ArticleHeadingSmall>
          )}
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
                opacity: imageHide ? 0.7 : 1
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
        <HideMetaDataOnToolTipDisplay size={size} />
      </HoverActionsAreaOverlay>
    </>
  );
};

export { ArticleBodyProps };

export default articleBodyDefault;
