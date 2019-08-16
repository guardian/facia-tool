import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createSelectCollectionItemType } from 'shared/selectors/collectionItem';
import {
  selectSharedState,
  selectArticleFragment
} from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemSizes,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import {
  cloneArticleFragmentToTarget,
  copyArticleFragmentImageMetaWithPersist,
  addImageToArticleFragment
} from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import {
  validateImageEvent,
  ValidationResponse
} from 'shared/util/validateImageSrc';
import {
  articleFragmentImageCriteria,
  editionsArticleFragmentImageCriteria,
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
} from 'constants/image';
import Sublinks from './Sublinks';
import { gridDropTypes } from 'constants/fronts';
import {
  selectIsArticleFragmentFormOpen,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import { bindActionCreators } from 'redux';
import ArticleFragmentFormInline from '../ArticleFragmentFormInline';
import { updateArticleFragmentMeta as updateArticleFragmentMetaAction } from 'actions/ArticleFragments';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import { events } from 'services/GA';

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
  size?: CollectionItemSizes;
  textSize?: CollectionItemSizes;
  isUneditable?: boolean;
  showMeta?: boolean;
  isSupporting?: boolean;
  canDragImage?: boolean;
  canShowPageViewData: boolean;
}

type ArticleContainerProps = ContainerProps & {
  onAddToClipboard: () => void;
  copyCollectionItemImageMeta: (from: string, to: string) => void;
  addImageToArticleFragment: (id: string, response: ValidationResponse) => void;
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  clearArticleFragmentSelection: (id: string) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
  numSupportingArticles: number;
  editMode: EditMode;
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
      isSupporting = false,
      children,
      getNodeProps,
      onSelect,
      onAddToClipboard = noop,
      type,
      size,
      textSize,
      isUneditable,
      numSupportingArticles,
      updateArticleFragmentMeta,
      clearArticleFragmentSelection,
      parentId,
      showMeta,
      frontId,
      canDragImage,
      canShowPageViewData = false
    } = this.props;

    const getCard = () => {
      switch (type) {
        case collectionItemTypes.ARTICLE:
          return (
            <Article
              frontId={frontId}
              id={uuid}
              isUneditable={isUneditable}
              {...getNodeProps()}
              onDelete={this.onDelete}
              onAddToClipboard={onAddToClipboard}
              onClick={isUneditable ? undefined : () => onSelect(uuid)}
              size={size}
              textSize={textSize}
              showMeta={showMeta}
              imageDropTypes={imageDropTypes}
              onImageDrop={this.handleImageDrop}
              canDragImage={canDragImage}
              canShowPageViewData={canShowPageViewData}
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
                size={size}
                textSize={textSize}
                showMeta={showMeta}
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
    };

    return isSelected ? (
      <ArticleFragmentFormInline
        articleFragmentId={uuid}
        isSupporting={isSupporting}
        key={uuid}
        form={uuid}
        frontId={frontId}
        onSave={meta => {
          updateArticleFragmentMeta(uuid, meta);
          clearArticleFragmentSelection(uuid);
        }}
        onCancel={() => clearArticleFragmentSelection(uuid)}
      />
    ) : (
      getCard()
    );
  }

  private onDelete = () => {
    this.props.onDelete();
  };

  private handleImageDrop = (e: React.DragEvent<HTMLElement>) => {
    events.imageAdded(this.props.frontId, 'drop-into-card');
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

    const isEditionsMode = this.props.editMode === 'editions';
    const imageCriteria = isEditionsMode
      ? editionsArticleFragmentImageCriteria
      : articleFragmentImageCriteria;

    // Our drag contains Grid data
    validateImageEvent(e, this.props.frontId, imageCriteria)
      .then(imageData =>
        this.props.addImageToArticleFragment(this.props.uuid, imageData)
      )
      .catch(alert);
  };
}

const createMapStateToProps = () => {
  const selectType = createSelectCollectionItemType();
  return (state: State, { uuid, frontId }: ContainerProps) => {
    const maybeArticle = selectArticleFragment(selectSharedState(state), uuid);
    let numSupportingArticles = 0;
    if (maybeArticle && maybeArticle.meta && maybeArticle.meta.supporting) {
      numSupportingArticles = maybeArticle.meta.supporting.length;
    }
    return {
      type: selectType(selectSharedState(state), uuid),
      isSelected: selectIsArticleFragmentFormOpen(state, uuid, frontId),
      numSupportingArticles,
      editMode: selectEditMode(state)
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: ContainerProps) => {
  return {
    onAddToClipboard: () => {
      dispatch(cloneArticleFragmentToTarget(props.uuid, 'clipboard'));
    },
    ...bindActionCreators(
      {
        copyCollectionItemImageMeta: copyArticleFragmentImageMetaWithPersist,
        addImageToArticleFragment,
        updateArticleFragmentMeta: updateArticleFragmentMetaAction,
        clearArticleFragmentSelection: editorClearArticleFragmentSelection
      },
      dispatch
    )
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
