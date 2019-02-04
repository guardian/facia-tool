import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { createGroupArticlesSelector } from 'shared/selectors/shared';

interface OuterProps {
  groupId: string;
  children: LevelChild<ArticleFragment>;
  onMove: MoveHandler<ArticleFragment>;
  onDrop: DropHandler;
  isUneditable?: boolean;
}

interface InnerProps {
  articleFragments: ArticleFragment[];
}

type Props = OuterProps & InnerProps;

const GroupLevel = ({
  children,
  groupId,
  articleFragments,
  onMove,
  onDrop,
  isUneditable
}: Props) => (
  <Level
    arr={articleFragments}
    parentType="group"
    parentId={groupId}
    type="articleFragment"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={(props, isTarget) => (
      <DropZone {...props} disabled={isUneditable} override={isTarget} />
    )}
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const groupArticleSelector = createGroupArticlesSelector();
  return (state: State, { groupId }: OuterProps) => ({
    articleFragments: groupArticleSelector(state, {
      groupId
    })
  });
};

export default connect(createMapStateToProps)(GroupLevel);
