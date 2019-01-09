import React from 'react';
import styled from 'styled-components';
import startCase from 'lodash/startCase';
import distanceInWords from 'date-fns/distance_in_words_to_now';

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
import CollectionItemNotification from '../collectionItem/CollectionItemNotification';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 130px;
  height: 83px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: #ff7f0f;
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: GHGuardianHeadline-Bold;
  padding-right: 3px;
`;

const ArticleHeadingSmall = CollectionItemHeading.extend`
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

interface ArticleBodyProps {
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
  isUneditable
}: ArticleBodyProps) => {
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
  return (
    <>
      <CollectionItemMetaContainer>
        {displayPlaceholders && (
          <>
            <TextPlaceholder />
            {size === 'default' && <TextPlaceholder width={25} />}
          </>
        )}
        {size === 'default' &&
          isLive && (
            <CollectionItemMetaHeading>
              {startCase(sectionName)}
            </CollectionItemMetaHeading>
          )}
        {(isLive || size === 'default') &&
          firstPublicationDate && (
            <CollectionItemMetaContent>
              {distanceInWords(new Date(firstPublicationDate))}
            </CollectionItemMetaContent>
          )}
        {!isLive &&
          !displayPlaceholders && (
            <NotLiveContainer>
              {firstPublicationDate
                ? notLiveLabels.takenDown
                : notLiveLabels.draft}
            </NotLiveContainer>
          )}
        {scheduledPublicationDate && (
          <CollectionItemMetaContent>
            {distanceInWords(new Date(scheduledPublicationDate))}
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
          {size === 'default' ? (
            <CollectionItemHeading data-testid="headline">
              {headline}
            </CollectionItemHeading>
          ) : (
            <ArticleHeadingSmall data-testid="headline">
              {headline}
            </ArticleHeadingSmall>
          )}
        </ArticleHeadingContainer>
        {size === 'default' &&
          trailText && <CollectionItemTrail>{trailText}</CollectionItemTrail>}
      </CollectionItemContent>
      {size === 'default' &&
        (displayPlaceholders ? (
          <ThumbnailPlaceholder />
        ) : (
          <Thumbnail
            style={{
              backgroundImage: `url('${thumbnail}')`
            }}
          />
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
