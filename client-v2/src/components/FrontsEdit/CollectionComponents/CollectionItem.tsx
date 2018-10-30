import React from 'react';
import { connect } from 'react-redux';
import Article from 'shared/components/article/Article';
import { State } from 'types/State';
import { createCollectionItemTypeSelector } from 'shared/selectors/collectionItem';
import { selectSharedState } from 'shared/selectors/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';
import { CollectionItemTypes } from 'shared/types/Collection';
import SnapLink from 'shared/components/snapLink/SnapLink';

interface ContainerProps {
  isSelected?: boolean;
  uuid: string;
  children?: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  parentId: string;
  size?: 'small' | 'default'
  displayType?: 'polaroid' | 'default'
}

type ArticleContainerProps = ContainerProps & {
  onDelete: (uuid: string) => void;
  type: CollectionItemTypes;
};

const ArticleContainer = ({
  uuid,
  isSelected,
  children,
  getNodeProps,
  onSelect,
  onDelete,
  displayType,
  type,
  size
}: ArticleContainerProps) => {
  switch (type) {
    case collectionItemTypes.ARTICLE:
      return (
        <Article
          id={uuid}
          {...getNodeProps()}
          onDelete={onDelete}
          onClick={() => onSelect(uuid)}
          fade={!isSelected}
          size={size}
          displayType={displayType}
        >
          {children}
        </Article>
      );
    case collectionItemTypes.SNAP_LINK:
      return (
        <SnapLink
          id={uuid}
          {...getNodeProps()}
          onDelete={onDelete}
          onClick={() => onSelect(uuid)}
          fade={!isSelected}
          size={size}
          displayType={displayType}
        >
          {children}
        </SnapLink>
      );
    default:
      return <p>Item with id {uuid} has unknown collection item type {type}</p>
  }
};

const createMapStateToProps = () => {
  const selectType = createCollectionItemTypeSelector();
  return (state: State, props: ContainerProps) => ({
    type: selectType(selectSharedState(state), props.uuid)
  });
};

export default connect(
  createMapStateToProps
)(ArticleContainer);
