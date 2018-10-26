import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import noop from 'lodash/noop';
import startCase from 'lodash/startCase';
import { toneColorMap, getToneColor } from 'shared/util/toneColorMap';

import ButtonHoverAction from 'shared/components/input/ButtonHoverAction';
import { getPaths } from '../../util/paths';
import {
  createArticleFromArticleFragmentSelector,
  selectSharedState,
  articleFragmentSelector
} from '../selectors/shared';
import { selectors } from 'shared/bundles/externalArticlesBundle';
import { State } from '../types/State';
import { DerivedArticle } from '../types/Article';
import { notLiveLabels } from 'constants/fronts';
import TextPlaceholder from 'shared/components/TextPlaceholder';
import BasePlaceholder from './BasePlaceholder';
import CollectionItemBody from './CollectionItemBody';
import CollectionItemContainer from './CollectionItemContainer';
import Thumbnail from './Thumbnail';
import HoverActions, {
  HoverActionsLeft,
  HoverActionsRight
} from './CollectionHoverItems';
import Link from './Link';
import CollectionItemHeading from './CollectionItemHeading';
import CollectionItemMetaContainer from './CollectionItemMetaContainer';
import CollectionItemContent from './CollectionItemContent';
import CollectionItemMetaHeading from './CollectionItemMetaHeading';

const ThumbnailPlaceholder = styled(BasePlaceholder)`
  width: 130px;
  height: 83px;
`;

const NotLiveContainer = styled(CollectionItemMetaHeading)`
  color: #ff7f0f;
`;

const ArticleBodyContainer = styled(CollectionItemBody)`
  :hover {
    ${CollectionItemMetaHeading} {
      color: #999;
    }
  }
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

interface ArticleComponentProps {
  id: string;
  draggable?: boolean;
  fade?: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDragEnter?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
}

interface ContainerProps extends ArticleComponentProps {
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article: DerivedArticle | void;
  isLoading: boolean;
  size?: 'default' | 'small';
  children: ReactNode;
} & ContainerProps;

interface ArticleBodyProps {
  firstPublicationDate?: string;
  scheduledPublicationDate?: string;
  tone?: string;
  kicker?: string;
  size?: 'default' | 'small';
  headline?: string;
  trailText?: string;
  thumbnail?: string | void;
  isLive?: boolean;
  urlPath?: string;
  displayPlaceholders?: boolean;
  uuid: string;
  onDelete: (id: string) => void;
}

const ArticleBody = ({
  firstPublicationDate,
  scheduledPublicationDate,
  tone,
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
          isLive && <CollectionItemMetaHeading>{startCase(tone)}</CollectionItemMetaHeading>}
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
          <KickerHeading style={{ color: tone && toneColorMap[tone] }}>
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

const ArticleComponent = ({
  id,
  isLoading,
  article,
  size = 'default',
  fade = false,
  draggable = false,
  onDragStart = noop,
  onDragEnter = noop,
  onDragOver = noop,
  onDrop = noop,
  onDelete = noop,
  onClick = noop,
  children
}: ComponentProps) => (
  <CollectionItemContainer
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDragEnter={onDragEnter}
    onDrop={onDrop}
    onClick={(e) => {
      if (isLoading || !article) {
        return;
      }
      e.stopPropagation();
      onClick();
    }}
  >
    <ArticleBodyContainer
      data-testid="article-body"
      size={size}
      fade={fade}
      style={{
        borderTopColor:
          size === 'default' && article
            ? getToneColor(article.tone, article.isLive)
            : '#c9c9c9'
      }}
    >
      {article && <ArticleBody {...article} size={size} onDelete={onDelete} />}
      {!article &&
        isLoading && (
          <ArticleBody
            uuid={id}
            displayPlaceholders={true}
            onDelete={onDelete}
            size={size}
          />
        )}
      {!article &&
        !isLoading && (
          <ArticleBody
            headline="Content not found"
            uuid={id}
            onDelete={onDelete}
            size={size}
          />
        )}
    </ArticleBodyContainer>
    {children}
  </CollectionItemContainer>
);

const createMapStateToProps = () => {
  const articleSelector = createArticleFromArticleFragmentSelector();
  return (
    state: State,
    props: ContainerProps
  ): { article: DerivedArticle | void; isLoading: boolean } => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    const article = articleSelector(sharedState, props.id);
    const articleFragment = articleFragmentSelector(sharedState, props.id);
    return {
      article,
      isLoading:
        !!articleFragment &&
        selectors.selectIsLoadingById(sharedState, articleFragment.id)
    };
  };
};

export { ArticleComponentProps, ArticleComponent };

export default connect(createMapStateToProps)(ArticleComponent);
