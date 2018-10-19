import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import * as Guration from 'lib/guration';
import Article from 'shared/components/Article';
import DropZone from 'components/DropZone';
import { Dispatch } from 'types/Store';
import { removeGroupArticleFragment } from 'actions/ArticleFragments';
import { ArticleFragmentDenormalised } from 'shared/types/Collection';

interface ContainerProps {
  isSelected?: boolean;
  uuid: string;
  supporting?: ArticleFragmentDenormalised[];
  children: any;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  parentId: string;
}

type ArticleFragmentProps = ContainerProps & {
  onDelete: () => void;
};

// We hoist the drop zone into the rendered element here,
// to prevent it from introducing gaps between supporting
// articles.
const dropIndicatorStyle = {
  marginLeft: '83px'
};

const dropZoneStyle = {
  marginTop: '-15px',
  padding: '3px'
};

const ArticleFragment = ({
  uuid,
  isSelected,
  supporting,
  children,
  getNodeProps,
  onSelect,
  onDelete
}: ArticleFragmentProps) => (
  <Article
    id={uuid}
    {...getNodeProps()}
    onDelete={onDelete}
    onClick={() => onSelect(uuid)}
    fade={!isSelected}
  >
    {supporting && (
      <Guration.Level
        arr={supporting}
        type="articleFragment"
        getKey={({ uuid: key }) => key}
        renderDrop={(getDropProps, { canDrop, isTarget }) => (
          <DropZone
            {...getDropProps()}
            override={!!canDrop && !!isTarget}
            style={dropZoneStyle}
            indicatorStyle={dropIndicatorStyle}
          />
        )}
      >
        {children}
      </Guration.Level>
    )}
  </Article>
);

const mapDispatchToProps = (
  dispatch: Dispatch,
  { parentId, uuid, onDelete }: ContainerProps
) => ({
  onDelete: () => {
    onDelete(uuid);
    dispatch(removeGroupArticleFragment(parentId, uuid));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(ArticleFragment);
