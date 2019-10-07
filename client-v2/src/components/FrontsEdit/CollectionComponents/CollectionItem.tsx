import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createSelectCollectionItemType } from 'shared/selectors/collectionItem';
import {
  selectSharedState,
  selectExternalArticleFromArticleFragment,
  selectSupportingArticleCount
} from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemSizes,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import {
  copyArticleFragmentImageMetaWithPersist,
  addImageToArticleFragment,
  addArticleFragmentToClipboard
} from 'actions/ArticleFragments';
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
import EditModeVisibility from 'components/util/EditModeVisibility';
import { styled } from 'constants/theme';
import { getPillarColor } from 'shared/util/getPillarColor';
import { isLive as isArticleLive } from 'util/CAPIUtils';

const imageDropTypes = [
  ...gridDropTypes,
  DRAG_DATA_COLLECTION_ITEM_IMAGE_OVERRIDE,
  DRAG_DATA_GRID_IMAGE_URL
];

const CollectionItemContainer = styled('div')<{
  pillarId: string | undefined;
  isLive?: boolean;
  size?: CollectionItemSizes;
}>`
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: ${({ size, pillarId, isLive, theme }) =>
    size !== 'small' && pillarId && isLive
      ? getPillarColor(pillarId, isLive)
      : theme.shared.base.colors.borderColor};
`;

interface ContainerProps {
  uuid: string;
  frontId: string;
  collectionId?: string;
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
  onAddToClipboard: (uuid: string) => void;
  copyCollectionItemImageMeta: (from: string, to: string) => void;
  addImageToArticleFragment: (id: string, response: ValidationResponse) => void;
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  clearArticleFragmentSelection: (id: string) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
  numSupportingArticles: number;
  editMode: EditMode;
  isLive?: boolean;
  pillarId?: string;
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
      collectionId,
      canDragImage,
      canShowPageViewData = false,
      isLive,
      pillarId
    } = this.props;

    const getSublinks = (
      <Sublinks
        numSupportingArticles={numSupportingArticles}
        toggleShowArticleSublinks={this.toggleShowArticleSublinks}
        showArticleSublinks={this.state.showArticleSublinks}
        parentId={parentId}
      />
    );

    const getCard = () => {
      switch (type) {
        case collectionItemTypes.ARTICLE:
          return (
            <Article
              frontId={frontId}
              collectionId={collectionId}
              id={uuid}
              isUneditable={isUneditable}
              {...getNodeProps()}
              onDelete={this.onDelete}
              onAddToClipboard={this.handleAddToClipboard}
              onClick={isUneditable ? undefined : () => onSelect(uuid)}
              size={size}
              textSize={textSize}
              showMeta={showMeta}
              imageDropTypes={imageDropTypes}
              onImageDrop={this.handleImageDrop}
              canDragImage={canDragImage}
              canShowPageViewData={canShowPageViewData}
            >
              <EditModeVisibility visibleMode="fronts">
                {getSublinks}
                {/* If there are no supporting articles, the children still need to be rendered, because the dropzone is a child  */}
                {numSupportingArticles === 0
                  ? children
                  : this.state.showArticleSublinks && children}
              </EditModeVisibility>
            </Article>
          );
        case collectionItemTypes.SNAP_LINK:
          return (
            <>
              <SnapLink
                frontId={frontId}
                collectionId={collectionId}
                id={uuid}
                isUneditable={isUneditable}
                {...getNodeProps()}
                onDelete={this.onDelete}
                onAddToClipboard={this.handleAddToClipboard}
                onClick={isUneditable ? undefined : () => onSelect(uuid)}
                size={size}
                textSize={textSize}
                showMeta={showMeta}
                canShowPageViewData={canShowPageViewData}
              />
              {getSublinks}
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

    return (
      <CollectionItemContainer size={size} isLive={isLive} pillarId={pillarId}>
        {isSelected ? (
          <>
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
              size={size}
            />
            {getSublinks}
            {numSupportingArticles === 0
              ? children
              : this.state.showArticleSublinks && children}
          </>
        ) : (
          getCard()
        )}
      </CollectionItemContainer>
    );
  }

  private handleAddToClipboard = () => {
    this.props.onAddToClipboard(this.props.uuid);
  };

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
    const maybeExternalArticle = selectExternalArticleFromArticleFragment(
      selectSharedState(state),
      uuid
    );
    return {
      type: selectType(selectSharedState(state), uuid),
      isSelected: selectIsArticleFragmentFormOpen(state, uuid, frontId),
      isLive: maybeExternalArticle && isArticleLive(maybeExternalArticle),
      pillarId: maybeExternalArticle && maybeExternalArticle.pillarId,
      numSupportingArticles: selectSupportingArticleCount(
        selectSharedState(state),
        uuid
      ),
      editMode: selectEditMode(state)
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      onAddToClipboard: addArticleFragmentToClipboard,
      copyCollectionItemImageMeta: copyArticleFragmentImageMetaWithPersist,
      addImageToArticleFragment,
      updateArticleFragmentMeta: updateArticleFragmentMetaAction,
      clearArticleFragmentSelection: editorClearArticleFragmentSelection
    },
    dispatch
  );
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
