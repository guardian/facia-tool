import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import {
  createSelectArticleFromArticleFragment,
  selectSharedState,
  selectArticleFragment
} from '../../selectors/shared';
import { selectors } from 'shared/bundles/externalArticlesBundle';
import { State } from '../../types/State';
import { DerivedArticle } from '../../types/Article';
import CollectionItemBody from '../collectionItem/CollectionItemBody';
import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import ArticleBody from './ArticleBody';
import { CollectionItemSizes } from 'shared/types/Collection';
import { getPillarColor } from 'shared/util/getPillarColor';
import DragIntentContainer from '../DragIntentContainer';
import ImageDragIntentIndicator from '../ImageDragIntentIndicator';

const ArticleBodyContainer = styled(CollectionItemBody)<{
  pillarId: string | undefined;
  isLive: boolean;
  isDraggingImageOver: boolean;
}>`
  position: relative;
  justify-content: space-between;
  border-top-color: ${({ size, pillarId, isLive, theme }) =>
    size === 'default' && pillarId && isLive
      ? getPillarColor(pillarId, isLive)
      : theme.shared.base.colors.borderColor};

  :hover {
    ${CollectionItemMetaHeading} {
      color: ${({ theme }) => theme.shared.base.colors.textMuted};
    }
  }
  ${ImageDragIntentIndicator} {
    display: none;
    ${({ isDraggingImageOver }) => isDraggingImageOver && `display: block;`}
  }
  height: 100%;
`;

interface ArticleComponentProps {
  id: string;
  draggable?: boolean;
  fade?: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDragEnter?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onAddToClipboard?: () => void;
  isUneditable?: boolean;
  showMeta?: boolean;
}

interface ContainerProps extends ArticleComponentProps {
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article?: DerivedArticle;
  isLoading?: boolean;
  size?: CollectionItemSizes;
  children: React.ReactNode;
  imageDropTypes?: string[];
  onImageDrop?: (e: React.DragEvent<HTMLElement>) => void;
} & ContainerProps;

interface ComponentState {
  isDraggingImageOver: boolean;
  isDraggingArticleOver: boolean;
}

class ArticleComponent extends React.Component<ComponentProps, ComponentState> {
  public state = {
    isDraggingImageOver: false,
    isDraggingArticleOver: false
  };

  public setIsImageHovering = (isDraggingImageOver: boolean) =>
    this.setState({ isDraggingImageOver });
  public setIsArticleHovering = (isDraggingArticleOver: boolean) =>
    this.setState({ isDraggingArticleOver });

  public render() {
    const {
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
      onAddToClipboard = noop,
      children,
      isUneditable,
      imageDropTypes = [],
      onImageDrop,
      showMeta
    } = this.props;

    const dragEventHasImageData = (e: React.DragEvent) =>
      e.dataTransfer.types.some(dataTransferType =>
        imageDropTypes.includes(dataTransferType)
      );

    const getArticleData = () =>
      article || {
        uuid: id,
        headline: !isLoading ? 'Content not found' : undefined
      };

    return (
      <DragIntentContainer
        filterRegisterEvent={e => !dragEventHasImageData(e)}
        onDragIntentStart={() => this.setIsArticleHovering(true)}
        onDragIntentEnd={() => this.setIsArticleHovering(false)}
      >
        <CollectionItemContainer
          draggable={draggable}
          isDraggingArticleOver={this.state.isDraggingArticleOver}
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
          <DragIntentContainer
            active={!!onImageDrop}
            filterRegisterEvent={dragEventHasImageData}
            onDragIntentStart={() => this.setIsImageHovering(true)}
            onDragIntentEnd={() => this.setIsImageHovering(false)}
            onDrop={e => {
              if (dragEventHasImageData(e) && onImageDrop) {
                onImageDrop(e);
              }
            }}
          >
            <ArticleBodyContainer
              data-testid="article-body"
              size={size}
              fade={fade}
              pillarId={article && article.pillarId}
              isLive={!!article && article.isLive}
              isDraggingImageOver={this.state.isDraggingImageOver}
            >
              <ArticleBody
                {...getArticleData()}
                size={size}
                isUneditable={!!article && isUneditable}
                onDelete={onDelete}
                onAddToClipboard={onAddToClipboard}
                displayPlaceholders={isLoading}
                showMeta={showMeta}
              />
              <ImageDragIntentIndicator />
            </ArticleBodyContainer>
          </DragIntentContainer>
          {children}
        </CollectionItemContainer>
      </DragIntentContainer>
    );
  }
}

const createMapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();
  return (
    state: State,
    props: ContainerProps
  ): { article?: DerivedArticle; isLoading: boolean } => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    const article = selectArticle(sharedState, props.id);
    const articleFragment = selectArticleFragment(sharedState, props.id);
    return {
      article,
      isLoading: selectors.selectIsLoadingInitialDataById(
        sharedState,
        articleFragment.id
      )
    };
  };
};

export { ArticleComponentProps, ArticleComponent };

export default connect(createMapStateToProps)(ArticleComponent);
