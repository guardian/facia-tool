import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createCollectionItemTypeSelector } from 'shared/selectors/collectionItem';
import {
  selectSharedState,
  externalArticleIdFromArticleFragmentSelector,
  articleFragmentSelector
} from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemDisplayTypes
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import {
  cloneArticleFragmentToTarget,
  copyArticleFragmentImageMetaWithPersist
} from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import { selectEditorArticleFragment } from 'bundles/frontsUIBundle';
import {
  validateImageEvent,
  ValidationResponse
} from 'shared/util/validateImageSrc';
import {
  articleFragmentImageCriteria as imageCriteria,
  DRAG_COLLECTION_ITEM_IMAGE
} from 'constants/image';
import Sublinks from './Sublinks';
import { gridDropTypes } from 'constants/fronts';

const imageDropTypes = [...gridDropTypes, DRAG_COLLECTION_ITEM_IMAGE];

interface ContainerProps {
  uuid: string;
  frontId: string;
  children?: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  onImageDrop?: (data: ValidationResponse) => void;
  parentId: string;
  displayType?: CollectionItemDisplayTypes;
  size?: 'small' | 'default';
  isUneditable?: boolean;
}

type ArticleContainerProps = ContainerProps & {
  onAddToClipboard: (
    externalArticleId: string | undefined,
    uuid: string
  ) => void;
  copyCollectionItemImageMeta: (from: string, to: string) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
  externalArticleId: string | undefined;
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

  public handleDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.props.onImageDrop) {
      return;
    }
    e.preventDefault();
    e.persist();

    // Our drag is a copy event, from another CollectionItem
    const articleUuid = e.dataTransfer.getData(DRAG_COLLECTION_ITEM_IMAGE);
    if (articleUuid) {
      this.props.copyCollectionItemImageMeta(articleUuid, this.props.uuid);
      return;
    }

    // Our drag contains Grid data
    validateImageEvent(e, this.props.frontId, imageCriteria)
      .then(this.props.onImageDrop)
      .catch(err => {
        // swallowing errors here as the drop may well be an articleFragment
        // rather than an image which is expected - TBD
        // console.log('@todo:handle error', err);
      });
  }

  public render() {
    const {
      uuid,
      isSelected,
      children,
      getNodeProps,
      onSelect,
      onDelete,
      onAddToClipboard = noop,
      displayType,
      type,
      size,
      isUneditable,
      externalArticleId,
      numSupportingArticles,
      parentId
    } = this.props;

    switch (type) {
      case collectionItemTypes.ARTICLE:
        return (
          <Article
            id={uuid}
            isUneditable={isUneditable}
            {...getNodeProps()}
            onDelete={onDelete}
            onAddToClipboard={() => onAddToClipboard(externalArticleId, uuid)}
            onClick={isUneditable ? undefined : () => onSelect(uuid)}
            fade={!isSelected}
            size={size}
            displayType={displayType}
            imageDropTypes={imageDropTypes}
            onImageDrop={this.handleDrop}
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
              onDelete={onDelete}
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
}

const createMapStateToProps = () => {
  const selectType = createCollectionItemTypeSelector();
  return (state: State, props: ContainerProps) => {
    const selectedArticleFragmentData = selectEditorArticleFragment(
      state,
      props.frontId
    );
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
      isSelected:
        !selectedArticleFragmentData ||
        selectedArticleFragmentData.id === props.uuid,
      externalArticleId: externalArticleIdFromArticleFragmentSelector(
        selectSharedState(state),
        props.uuid
      ),
      numSupportingArticles
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (id: string | undefined, uuid: string) => {
      if (!id) {
        return;
      }
      dispatch(cloneArticleFragmentToTarget(uuid, 'clipboard'));
    },
    copyCollectionItemImageMeta: (from: string, to: string) =>
      dispatch(copyArticleFragmentImageMetaWithPersist(from, to))
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
