// @flow

import React, { type Node as ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import noop from 'lodash/noop';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import toneColorMap from 'shared/util/toneColorMap';
import { getThumbnail } from 'util/CAPIUtils';
import {
  externalArticleFromArticleFragmentSelector,
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
  padding: 10px;
`;

const ActionButton = styled('button')`
  appearance: none;
  background: ${({ danger }) => (danger ? '#ff7f0f' : '#767676')};
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  height: 24px;
  line-height: 1;
  margin: 0;
  width: 24px;

  &:hover {
    background: ${({ danger }) => (danger ? '#e05e00' : '#333333')};
  }
`;

ActionButton.defaultProps = {
  danger: false
};

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
                `url('${getThumbnail(article.elements) || ''}')`
            }}
          />
        )}
        <HoverActions>
          <ActionButton
            danger
            onClick={e => {
              // stop the parent from opening the edit panel
              e.stopPropagation();
              onDelete();
            }}
          >
            ✕
          </ActionButton>
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
  article: externalArticleFromArticleFragmentSelector(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleComponent);
