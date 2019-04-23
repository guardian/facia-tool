import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import { CollectionItemDisplayTypes } from 'shared/types/Collection';
import ArticleDrag from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { createSupportingArticlesSelector } from 'shared/selectors/shared';
import { gridDataTransferTypes } from 'constants/image';

interface OuterProps {
  articleFragmentId: string;
  children: LevelChild<ArticleFragment>;
  onMove: MoveHandler<ArticleFragment>;
  onDrop: DropHandler;
  displayType?: CollectionItemDisplayTypes;
  isUneditable?: boolean;
}

interface InnerProps {
  supporting: ArticleFragment[];
}

type Props = OuterProps & InnerProps;

const ArticleFragmentLevel = ({
  children,
  articleFragmentId,
  supporting,
  onMove,
  onDrop,
  displayType = 'default',
  isUneditable
}: Props) => (
  <Level
    arr={supporting || []}
    blockingDataTransferTypes={Object.values(gridDataTransferTypes)}
    parentType="articleFragment"
    parentId={articleFragmentId}
    type="articleFragment"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={(props, isTarget, isActive) => (
      <DropZone
        {...props}
        disabled={isUneditable || !isActive}
        override={isTarget}
        dropColor="hsl(0, 0%, 64%)"
        style={{
          marginTop: '-30px',
          height: '30px'
        }}
        indicatorStyle={{
          marginLeft: `${displayType === 'default' ? '80px' : '20px'}`,
          marginRight: `${displayType === 'default' ? '130px' : 0}`,
          top: '66%',
          height: '33%'
        }}
      />
    )}
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const supportingArticlesSelector = createSupportingArticlesSelector();
  return (state: State, { articleFragmentId }: OuterProps) => ({
    supporting: supportingArticlesSelector(state, { articleFragmentId })
  });
};

export default connect(createMapStateToProps)(ArticleFragmentLevel);
//
