import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createCollectionItemTypeSelector } from 'shared/selectors/collectionItem';
import {
  selectSharedState,
  externalArticleIdFromArticleFragmentSelector
} from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemDisplayTypes
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import { insertArticleFragment } from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import { selectEditorArticleFragment } from 'bundles/frontsUIBundle';
import {
  validateImageEvent,
  ValidationResponse
} from 'shared/util/validateImageSrc';
import {
  articleFragmentImageCriteria as imageCriteria,
  gridDataTransferTypes
} from 'constants/image';

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
  articleNotifications?: string[];
  isUneditable?: boolean;
}

type ArticleContainerProps = ContainerProps & {
  onAddToClipboard: (externalArticleId: string | undefined) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
  externalArticleId: string | undefined;
};

class CollectionItem extends React.Component<ArticleContainerProps> {
  public getDropHandler(onDrop?: (data: ValidationResponse) => void) {
    if (!onDrop) {
      return;
    }
    return (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.persist();
      validateImageEvent(e, this.props.frontId, imageCriteria)
        .then(onDrop)
        .catch(err => {
          // swallowing errors here as the drop may well be an articleFragment
          // rather than an image which is expected - TBD
          // console.log('@todo:handle error', err);
        });
    };
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
      articleNotifications,
      isUneditable,
      externalArticleId
    } = this.props;

    const notifications =
      articleNotifications && articleNotifications.length
        ? articleNotifications
        : undefined;

    switch (type) {
      case collectionItemTypes.ARTICLE:
        return (
          <Article
            id={uuid}
            isUneditable={isUneditable}
            {...getNodeProps()}
            onDelete={onDelete}
            onAddToClipboard={() => onAddToClipboard(externalArticleId)}
            onClick={() => onSelect(uuid)}
            fade={!isSelected}
            size={size}
            displayType={displayType}
            notifications={notifications}
            imageDropTypes={Object.values(gridDataTransferTypes)}
            onImageDrop={this.getDropHandler(this.props.onImageDrop)}
          >
            {children}
          </Article>
        );
      case collectionItemTypes.SNAP_LINK:
        return (
          <SnapLink
            id={uuid}
            isUneditable={isUneditable}
            {...getNodeProps()}
            onDelete={onDelete}
            onClick={() => onSelect(uuid)}
            fade={!isSelected}
            size={size}
            displayType={displayType}
            notifications={notifications}
          >
            {children}
          </SnapLink>
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
    return {
      type: selectType(selectSharedState(state), props.uuid),
      isSelected:
        !selectedArticleFragmentData ||
        selectedArticleFragmentData.id === props.uuid,
      externalArticleId: externalArticleIdFromArticleFragmentSelector(
        selectSharedState(state),
        props.uuid
      )
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (id: string | undefined) => {
      if (id) {
        dispatch(
          insertArticleFragment(
            { id: 'clipboard', type: 'clipboard', index: 0 },
            // @TODO - if this is proving too slow we can pass the whole external article into
            // this components and insert that data rather than fetching it from CAPI
            { type: 'REF', data: id },
            'clipboard'
          )
        );
      }
    }
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
