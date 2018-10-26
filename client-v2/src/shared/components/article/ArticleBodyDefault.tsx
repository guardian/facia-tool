import React from 'react';
import styled from 'styled-components';
import startCase from 'lodash/startCase';
import distanceInWords from 'date-fns/distance_in_words_to_now';

import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from '../CollectionHoverItems';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import BasePlaceholder from '../BasePlaceholder';
import { getPillarColor } from 'shared/util/getPillarColor';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import ButtonHoverAction from 'shared/components/input/ButtonHoverAction';
import { getPaths } from '../../../util/paths';
import { notLiveLabels } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import Thumbnail from '../Thumbnail';
import Link from '../Link';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';

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
  size?: 'default' | 'small';
  headline?: string;
  trailText?: string;
  thumbnail?: string | void;
  isLive?: boolean;
  urlPath?: string;
  sectionName?: string,
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
  uuid,
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
          isLive && <CollectionItemMetaHeading>{startCase(sectionName)}</CollectionItemMetaHeading>}
        {(isLive || size === 'default') &&
          firstPublicationDate && (
            <PublicationDate>
              {distanceInWords(new Date(firstPublicationDate))}
            </PublicationDate>
          )}
        {!isLive && (
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
            <CollectionItemHeading>{headline}</CollectionItemHeading>
          ) : (
            <ArticleHeadingSmall>{headline}</ArticleHeadingSmall>
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
      <HoverActions>
        <HoverActionsLeft>
          <Link
            href={
              isLive
                ? `https://www.theguardian.com/${urlPath}`
                : `https://preview.gutools.co.uk/${urlPath}`
            }
          >
            <ButtonHoverAction action="view" title="View" />
          </Link>
          {isLive ? (
            <Link
              href={getPaths(`https://www.theguardian.com/${urlPath}`).ophan}
            >
              <ButtonHoverAction action="ophan" title="Ophan" />
            </Link>
          ) : null}
        </HoverActionsLeft>
        <HoverActionsRight>
          <ButtonHoverAction
            action="delete"
            danger
            onClick={(e: React.SyntheticEvent) => {
              // stop the parent from opening the edit panel
              e.stopPropagation();
              onDelete(uuid);
            }}
            title="Delete"
          />
        </HoverActionsRight>
      </HoverActions>
    </>
  );
};

export { ArticleBodyProps };

export default articleBodyDefault;
