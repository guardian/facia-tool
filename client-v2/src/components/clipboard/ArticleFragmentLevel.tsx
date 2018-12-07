import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import { CollectionItemDisplayTypes } from 'shared/types/Collection';
import ArticleDrag from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { createSupportingArticlesSelector } from 'shared/selectors/shared';

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
    isUneditable={isUneditable}
    arr={supporting || []}
    parentType="articleFragment"
    parentId={articleFragmentId}
    type="articleFragment"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={(props, isTarget) => (
      <DropZone
        {...props}
        override={isTarget}
        dropColor="hsl(0, 0%, 64%)"
        style={{
          marginTop: '-15px',
          padding: '3px'
        }}
        indicatorStyle={{
          marginLeft: '20px',
          marginRight: `${displayType === 'default' ? '130px' : 0}`
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
