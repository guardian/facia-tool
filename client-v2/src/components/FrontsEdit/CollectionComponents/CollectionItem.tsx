import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createCollectionItemTypeSelector } from 'shared/selectors/collectionItem';
import { selectSharedState } from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import {
  CollectionItemTypes,
  CollectionItemDisplayTypes
} from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';
import { insertArticleFragment } from 'actions/ArticleFragments';
import noop from 'lodash/noop';
import { selectEditorArticleFragment } from 'bundles/frontsUIBundle';

interface ContainerProps {
  uuid: string;
  frontId: string;
  children?: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  parentId: string;
  displayType?: CollectionItemDisplayTypes;
  size?: 'small' | 'default';
  articleNotifications?: string[];
  isUneditable?: boolean;
}

type ArticleContainerProps = ContainerProps & {
  onAddToClipboard: (uuid: string) => void;
  type: CollectionItemTypes;
  isSelected: boolean;
};

const CollectionItem = ({
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
  isUneditable
}: ArticleContainerProps) => {
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
          onAddToClipboard={() => onAddToClipboard(uuid)}
          onClick={() => onSelect(uuid)}
          fade={!isSelected}
          size={size}
          displayType={displayType}
          notifications={notifications}
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
};

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
        selectedArticleFragmentData.id === props.uuid
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onAddToClipboard: (id: string) =>
      dispatch(
        insertArticleFragment(
          { id: 'clipboard', type: 'clipboard', index: 0 },
          id,
          'clipboard'
        )
      )
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionItem);
