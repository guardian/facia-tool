import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createCollectionItemTypeSelector } from 'shared/selectors/collectionItem';
import {
  selectSharedState,
  articleFragmentSelector
} from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemDisplayTypes,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import {
  cloneArticleFragmentToTarget,
  copyArticleFragmentImageMetaWithPersist,
  addImageToArticleFragment,
  updateArticleFragmentMeta as updateArticleFragmentMetaAction
} from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import {
  editorClearArticleFragmentSelection,
  selectIsArticleFragmentFormOpen
} from 'bundles/frontsUIBundle';
import {
  validateImageEvent,
  ValidationResponse
} from 'shared/util/validateImageSrc';
import {
  articleFragmentImageCriteria as imageCriteria,
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
} from 'constants/image';
import Sublinks from './Sublinks';
import { gridDropTypes } from 'constants/fronts';
import ArticleFragmentForm from '../ArticleFragmentForm';

const imageDropTypes = [
  ...gridDropTypes,
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
];

interface ContainerProps {
  uuid: string;
  frontId: string;
  children?: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: () => void;
  parentId: string;
  displayType?: CollectionItemDisplayTypes;
  size?: 'small' | 'default';
  isUneditable?: boolean;
  isSupporting?: boolean;
}

type ArticleContainerProps = ContainerProps & {
  onAddToClipboard: () => void;
  copyCollectionItemImageMeta: (from: string, to: string) => void;
  addImageToArticleFragment: (id: string, response: ValidationResponse) => void;
  updateArticleFragmentMeta: (meta: ArticleFragmentMeta) => void;
  clearArticleFragmentSelection: (id: string) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
  numSupportingArticles: number;
};

class CollectionItem extends React.Component<ArticleContainerProps> {
  public state = {
    showArticleSublinks: false
  };

  public toggleShowArticleSublinks = (e?: React.MouseEvent) => {
    const togPos = this.state.showArticleSublinks ? false : true;
    this.setState({ showArticleSublinks: togPos });
    if (e) {
      e.stopPropagation();
    }
  };

  public render() {
    const {
      uuid,
      isSelected,
      children,
      getNodeProps,
      onSelect,
      onAddToClipboard = noop,
      isSupporting = false,
      displayType,
      type,
      size,
      isUneditable,
      numSupportingArticles,
      updateArticleFragmentMeta,
      clearArticleFragmentSelection,
      parentId,
      frontId
    } = this.props;

    switch (type) {
      case collectionItemTypes.ARTICLE:
        return (
          <>
            {!isSelected && (
              <Article
                id={uuid}
                isUneditable={isUneditable}
                {...getNodeProps()}
                onDelete={this.onDelete}
                onAddToClipboard={onAddToClipboard}
                onClick={isUneditable ? undefined : () => onSelect(uuid)}
                size={size}
                displayType={displayType}
                imageDropTypes={imageDropTypes}
                onImageDrop={this.handleImageDrop}
              >
                <Sublinks
                  numSupportingArticles={numSupportingArticles}
                  toggleShowArticleSublinks={this.toggleShowArticleSublinks}
                  showArticleSublinks={this.state.showArticleSublinks}
                  parentId={parentId}
                />
                {/* If there are no supporting articles, the children still need to be rendered, because the dropzone is a child  */}
                {numSupportingArticles === 0
                  ? children
                  : this.state.showArticleSublinks && children}
              </Article>
            )}
            {isSelected && (
              <ArticleFragmentForm
                articleFragmentId={uuid}
                isSupporting={isSupporting}
                key={uuid}
                form={uuid}
                frontId={frontId}
                onSave={meta => {
                  updateArticleFragmentMeta(meta);
                  clearArticleFragmentSelection(uuid);
                }}
                onCancel={() => clearArticleFragmentSelection(uuid)}
              />
            )}
          </>
        );
      case collectionItemTypes.SNAP_LINK:
        return (
          <>
            <SnapLink
              id={uuid}
              isUneditable={isUneditable}
              {...getNodeProps()}
              onDelete={this.onDelete}
              onClick={isUneditable ? undefined : () => onSelect(uuid)}
              fade={!isSelected}
              size={size}
              displayType={displayType}
            />
            <Sublinks
              numSupportingArticles={numSupportingArticles}
              toggleShowArticleSublinks={this.toggleShowArticleSublinks}
              showArticleSublinks={this.state.showArticleSublinks}
              parentId={parentId}
            />
            {numSupportingArticles === 0
              ? children
              : this.state.showArticleSublinks && children}
          </>
        );
      default:
        return (
          <p>
            Item with id {uuid} has unknown collection item type {type}
          </p>
        );
    }
  }

  private onDelete = () => {
    this.props.onDelete();
  };

  private handleImageDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.persist();

    // Our drag is a copy event, from another CollectionItem
    const articleUuid = e.dataTransfer.getData(
      DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE
    );
    if (articleUuid) {
      this.props.copyCollectionItemImageMeta(articleUuid, this.props.uuid);
      return;
    }

    // Our drag contains Grid data
    validateImageEvent(e, this.props.frontId, imageCriteria)
      .then(imageData =>
        this.props.addImageToArticleFragment(this.props.uuid, imageData)
      )
      .catch(alert);
  };
}

const createMapStateToProps = () => {
  const selectType = createCollectionItemTypeSelector();
  return (state: State, props: ContainerProps) => {
    const maybeArticle = articleFragmentSelector(
      selectSharedState(state),
      props.uuid
    );
    let numSupportingArticles = 0;
    if (maybeArticle && maybeArticle.meta && maybeArticle.meta.supporting) {
      numSupportingArticles = maybeArticle.meta.supporting.length;
    }
    return {
      type: selectType(selectSharedState(state), props.uuid),
      isSelected: selectIsArticleFragmentFormOpen(
        state,
        props.uuid,
        props.frontId
      ),
      numSupportingArticles
    };
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { uuid, frontId }: ContainerProps
) => {
  return {
    onAddToClipboard: () => {
      dispatch(cloneArticleFragmentToTarget(uuid, 'clipboard'));
    },
    copyCollectionItemImageMeta: (from: string, to: string) =>
      dispatch(copyArticleFragmentImageMetaWithPersist(from, to)),
    addImageToArticleFragment: (id: string, response: ValidationResponse) =>
      dispatch(addImageToArticleFragment(id, response)),
    updateArticleFragmentMeta: (meta: ArticleFragmentMeta) =>
      dispatch(updateArticleFragmentMetaAction(uuid, meta)),
    clearArticleFragmentSelection: (id: string) =>
      dispatch(editorClearArticleFragmentSelection(id))
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
