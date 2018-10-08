// @flow

import React, { type Node as ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import noop from 'lodash/noop';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import toneColorMap from 'shared/util/toneColorMap';
import ButtonHoverAction from 'shared/components/input/ButtonHoverAction';
import { getThumbnailFromElements } from 'util/CAPIUtils';
import { getPaths } from '../../util/paths';

import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import type { State } from '../types/State';
import type { Article } from '../types/Article';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  draggable: boolean,
  onDragStart?: DragEvent => void,
  onDragOver?: DragEvent => void,
  onDrop?: DragEvent => void,
  onDelete?: () => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?Article,
  size: 'default' | 'small',
  children: ReactNode
} & ContainerProps;

const HoverActions = styled('div')`
  display: flex;
  justify-content: space-between;
  align-content: flex-end;
  padding: 0 10px 8px;
`;

const HoverActionsLeft = styled('div')`
  display: flex;
  justify-content: space-around;
`;

const HoverActionsRight = styled('div')`
  display: flex;
  justify-content: space-around;
`;

const Link = styled(`a`).attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;
`;

const Thumbnail = styled('div')`
  width: 130px;
  height: 83px;
  background-size: cover;
`;

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans-Bold;
`;

const ArticleContainer = styled('div')`
  background-color: #fff;
`;

const ArticleBodyContainer = styled('div')`
  display: flex;
  position: relative;
  border-top: 1px solid #333;
  min-height: 35px;
  cursor: pointer;
  position: relative;

  ${HoverActions} {
    bottom: 0;
    left: 0;
    opacity: 1;
    position: absolute;
    right: 0;
    visibility: hidden;
  }

  ${Tone} {
    transition: color ${({ transitionTime }) => transitionTime}s;
  }

  ${Thumbnail} {
    transition: opacity ${({ transitionTime }) => transitionTime}s;
  }

  ${HoverActions} {
    transition: opacity ${({ transitionTime }) => transitionTime}s,
      visibility 0s linear ${({ transitionTime }) => transitionTime}s;
    visibility: hidden;
    opacity: 0;
  }

  :hover {
    background-color: #ededed;

    ${Tone} {
      color: #999;
    }

    ${Thumbnail} {
      opacity: 0.2;
    }

    ${HoverActions} {
      transition-delay: 0s;
      visibility: visible;
      opacity: 1;
    }
  }
`;

ArticleBodyContainer.defaultProps = {
  transitionTime: 0.3
};

const ArticleMetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0px 8px;
`;

const ArticleContentContainer = styled('div')`
  position: relative;
  width: calc(100% - 210px);
  margin-top: 2px;
  padding: 0 8px;
`;

const KickerHeading = styled('span')`
  font-size: 16px;
  font-family: GHGuardianHeadline-Bold;
`;

const ArticleHeading = styled('span')`
  font-size: 16px;
  font-family: GhGuardianHeadline-Medium;
`;

const ArticleHeadingSmall = ArticleHeading.extend`
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

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const ArticleComponent = ({
  article,
  size = 'default',
  draggable = false,
  onDragStart = noop,
  onDragOver = noop,
  onDrop = noop,
  onDelete = noop,
  children
}: ComponentProps) => {
  if (!article) {
    return null;
  }
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
  return (
    <ArticleContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ArticleBodyContainer
        key={article.headline}
        style={{
          borderTopColor:
            size === 'default' ? toneColorMap[article.tone] : '#c9c9c9'
        }}
      >
        <ArticleMetaContainer>
          {size === 'default' && <Tone>{startCase(article.tone)}</Tone>}
          {article.firstPublicationDate && (
            <FirstPublished>
              {distanceInWords(new Date(article.firstPublicationDate))}
            </FirstPublished>
          )}
          <ShortVerticalPinline />
        </ArticleMetaContainer>
        <ArticleContentContainer>
          <ArticleHeadingContainer>
            <KickerHeading style={{ color: toneColorMap[article.tone] }}>
              {article.sectionName}
            </KickerHeading>
            &nbsp;
            {size === 'default' ? (
              <ArticleHeading>{article.headline}</ArticleHeading>
            ) : (
              <ArticleHeadingSmall>{article.headline}</ArticleHeadingSmall>
            )}
          </ArticleHeadingContainer>
          {size === 'default' &&
            article.trailText && <Trail>{article.trailText}</Trail>}
          <div>
            {!article.isLive &&
              (article.firstPublicationDate ? 'Taken Down' : 'Draft')}
          </div>
        </ArticleContentContainer>
        {size === 'default' && (
          <Thumbnail
            style={{
              backgroundImage:
                article.elements &&
                `url('${getThumbnailFromElements(article.elements) || ''}')`
            }}
          />
        )}
        <HoverActions>
          <HoverActionsLeft>
            <Link
              href={
                article.isLive
                  ? `https://www.theguardian.com/${article.urlPath}`
                  : `https://preview.gutools.co.uk/${article.urlPath}`
              }
            >
              <ButtonHoverAction action="view" title="View" />
            </Link>
            {article.isLive ? (
              <Link
                href={
                  getPaths(`https://www.theguardian.com/${article.urlPath}`)
                    .ophan
                }
              >
                <ButtonHoverAction action="ophan" title="Ophan" />
              </Link>
            ) : null}
          </HoverActionsLeft>
          <HoverActionsRight>
            <ButtonHoverAction
              action="delete"
              danger
              onClick={(e: SyntheticEvent<>) => {
                // stop the parent from opening the edit panel
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            />
          </HoverActionsRight>
        </HoverActions>
      </ArticleBodyContainer>
      {children}
    </ArticleContainer>
  );
};

// $FlowFixMe
const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: ?Article } => ({
  article: articleFromArticleFragmentSelector(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleComponent);
