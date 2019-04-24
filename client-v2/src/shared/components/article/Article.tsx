import React from 'react';
import { styled } from 'shared/constants/theme';
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
import DragIntentContainer from '../DragIntentContainer';

const ArticleBodyContainer = styled(CollectionItemBody)<{
  pillarId: string | undefined;
  isLive: boolean;
}>`
  border-top-color: ${({ size, pillarId, isLive, theme }) =>
    size === 'default' && pillarId && isLive
      ? getPillarColor(pillarId, isLive)
      : theme.shared.base.colors.borderColor};

  :hover {
    ${CollectionItemMetaHeading} {
      color: ${({ theme }) => theme.shared.base.colors.textMuted};
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
  isUneditable?: boolean;
}

interface ContainerProps extends ArticleComponentProps {
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article?: DerivedArticle;
  isLoading?: boolean;
  displayType?: CollectionItemDisplayTypes;
  size?: CollectionItemSizes;
  children: React.ReactNode;
  imageDropTypes?: string[];
  onImageDrop?: (e: React.DragEvent<HTMLElement>) => void;
} & ContainerProps;

const articleBodyComponentMap: {
  [id: string]: React.ComponentType<ArticleBodyProps>;
} = {
  default: ArticleBodyDefault,
  polaroid: ArticleBodyPolaroid
};

class ArticleComponent extends React.Component<ComponentProps> {
  public state = {
    isHoveredWithImage: false
  };

  public setIsHovered = (isHoveredWithImage: boolean) =>
    this.setState({ isHoveredWithImage });

  public render() {
    const {
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
      children,
      isUneditable,
      imageDropTypes = [],
      onImageDrop
    } = this.props;
    const ArticleBody = articleBodyComponentMap[displayType];

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
        <DragIntentContainer
          active={!!onImageDrop}
          filterRegisterEvent={dragEventHasImageData}
          onDragIntentStart={() => this.setIsHovered(true)}
          onDragIntentEnd={() => this.setIsHovered(false)}
          onDrop={e => {
            if (dragEventHasImageData(e) && onImageDrop) {
              onImageDrop(e);
            }
          }}
        >
          <ArticleBodyContainer
            data-testid="article-body"
            style={{
              boxShadow: this.state.isHoveredWithImage
                ? 'inset 0 0 0 1px orange'
                : 'none'
            }}
            size={size}
            fade={fade}
            displayType={displayType}
            pillarId={article && article.pillarId}
            isLive={!!article && article.isLive}
          >
            <ArticleBody
              {...getArticleData()}
              size={size}
              isUneditable={!!article && isUneditable}
              onDelete={onDelete}
              onAddToClipboard={onAddToClipboard}
              displayPlaceholders={isLoading}
            />
          </ArticleBodyContainer>
        </DragIntentContainer>
        {children}
      </CollectionItemContainer>
    );
  }
}

const createMapStateToProps = () => {
  const articleSelector = createArticleFromArticleFragmentSelector();
  return (
    state: State,
    props: ContainerProps
  ): { article?: DerivedArticle; isLoading: boolean } => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    const article = articleSelector(sharedState, props.id);
    const articleFragment = articleFragmentSelector(sharedState, props.id);
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
