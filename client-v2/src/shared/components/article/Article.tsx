import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import {
  createArticleFromArticleFragmentSelector,
  selectSharedState,
  articleFragmentSelector
} from '../../selectors/shared';
import { selectors } from 'shared/bundles/externalArticlesBundle';
import { State } from '../../types/State';
import { DerivedArticle } from '../../types/Article';
import CollectionItemBody from '../collectionItem/CollectionItemBody';
import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import ArticleBodyPolaroid from './ArticleBodyPolaroid';
import ArticleBodyDefault, { ArticleBodyProps } from './ArticleBodyDefault';
import {
  CollectionItemDisplayTypes,
  CollectionItemSizes
} from 'shared/types/Collection';
import { getPillarColor } from 'shared/util/getPillarColor';

const ArticleBodyContainer = styled(CollectionItemBody)`
  :hover {
    ${CollectionItemMetaHeading} {
      color: #999;
    }
  }
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
  onAddToClipboard?: (id: string) => void;
}

interface ContainerProps extends ArticleComponentProps {
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article: DerivedArticle | void;
  isLoading?: boolean;
  displayType?: CollectionItemDisplayTypes;
  size?: CollectionItemSizes;
  children: React.ReactNode;
} & ContainerProps;

const articleBodyComponentMap: {
  [id: string]: React.ComponentType<ArticleBodyProps>;
} = {
  default: ArticleBodyDefault,
  polaroid: ArticleBodyPolaroid
};

const ArticleComponent = ({
  id,
  displayType = 'default',
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
  onAddToClipboard = noop,
  children
}: ComponentProps) => {
  const ArticleBody = articleBodyComponentMap[displayType];
  return (
    <CollectionItemContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      onClick={e => {
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
        displayType={displayType}
        style={{
          borderTopColor:
            size === 'default' && article
              ? getPillarColor(article.pillarId, article.isLive)
              : '#c9c9c9'
        }}
      >
        {article && (
          <ArticleBody
            {...article}
            size={size}
            onDelete={onDelete}
            onAddToClipboard={onAddToClipboard}
          />
        )}
        {!article &&
          isLoading && (
            <ArticleBody
              uuid={id}
              displayPlaceholders={true}
              onDelete={onDelete}
              onAddToClipboard={onAddToClipboard}
              size={size}
            />
          )}
        {!article &&
          !isLoading && (
            <ArticleBody
              headline="Content not found"
              uuid={id}
              onDelete={onDelete}
              onAddToClipboard={onAddToClipboard}
              size={size}
            />
          )}
      </ArticleBodyContainer>
      {children}
    </CollectionItemContainer>
  );
};

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
