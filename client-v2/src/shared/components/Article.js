// @flow

import React, { type Node as ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import noop from 'lodash/noop';
import startCase from 'lodash/startCase';

import toneColorMap from 'shared/util/toneColorMap';
import { getThumbnail } from 'util/CAPIUtils';
import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import Clearfix from './layout/Clearfix';
import type { State } from '../types/State';
import type { Article } from '../types/Article';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  draggable: boolean,
  onDragStart?: DragEvent => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?Article,
  size: 'default' | 'small',
  children: ReactNode
} & ContainerProps;

const ArticleContainer = Clearfix.extend`
  background-color: #fff;
`;

const ArticleBodyContainer = Clearfix.extend`
  display: flex;
  position: relative;
  border-top: 1px solid #333;
  min-height: 35px;
  cursor: pointer;
`;

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

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans-Bold;
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

const Thumbnail = styled('div')`
  width: 130px;
  height: 83px;
  background-size: cover;
`;

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const MetaPinline = styled('div')`
  position: absolute;
  top: 0;
  right: 0;
  height: 20px;
  border-right: solid 1px #c9c9c9;
`;

const ArticleComponent = ({
  article,
  size = 'default',
  draggable = false,
  onDragStart = noop,
  children
}: ComponentProps) => {
  if (!article) {
    return null;
  }
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
  return (
    <ArticleContainer>
      <ArticleBodyContainer
        key={article.headline}
        style={{
          borderTopColor:
            size === 'default' ? toneColorMap[article.tone] : '#c9c9c9'
        }}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <ArticleMetaContainer>
          {size === 'default' && <Tone>{startCase(article.tone)}</Tone>}
          {article.firstPublicationDate && (
            <FirstPublished>
              {distanceInWords(new Date(article.firstPublicationDate))}
            </FirstPublished>
          )}
          <MetaPinline />
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
