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
  HoverDeleteButton
} from '../input/HoverActionButtons';
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from '../CollectionHoverItems';
import { CollectionItemSizes } from 'shared/types/Collection';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 130px;
  height: 83px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: #ff7f0f;
`;

const KickerHeading = styled(CollectionItemHeading)`
  font-family: GHGuardianHeadline-Bold;
`;

const ArticleHeadingSmall = CollectionItemHeading.extend`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Trail = styled('div')`
  width: 100%;
  margin-top: 3px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: TS3TextSans;
`;

const ArticleHeadingContainerSmall = styled('div')`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PublicationDate = styled('div')`
  font-size: 12px;
  margin: 2px 0;
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
  onDelete: (id: string) => void;
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
  onDelete
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
            <PublicationDate>
              {distanceInWords(new Date(firstPublicationDate))}
            </PublicationDate>
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
          <PublicationDate>
            {distanceInWords(new Date(scheduledPublicationDate))}
          </PublicationDate>
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
          <KickerHeading style={{ color: getPillarColor(pillarId, true) }}>
            {kicker}
          </KickerHeading>
          &nbsp;
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
        {size === 'default' && trailText && <Trail>{trailText}</Trail>}
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
      <HoverActionsAreaOverlay>
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
          buttons={[{ text: 'Delete', component: HoverDeleteButton }]}
          buttonProps={{
            isLive,
            urlPath,
            onDelete
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
