import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag, {
  dragOffsetX,
  dragOffsetY
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { collectionDropTypeBlacklist } from 'constants/fronts';
import { createArticlesFromIdsSelector } from 'shared/selectors/shared';

interface OuterProps {
  groupId: string;
  articleFragmentIds: string[];
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
    blacklistedDataTransferTypes={collectionDropTypeBlacklist}
    parentType="group"
    parentId={groupId}
    type="articleFragment"
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={
      isUneditable
        ? null
        : (props, isTarget, isActive) => (
            <DropZone
              {...props}
              disabled={!isActive}
              override={isTarget}
              doubleHeight={!articleFragments.length}
            />
          )
    }
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const articlesFromIdsSelector = createArticlesFromIdsSelector();
  return (state: State, { articleFragmentIds }: OuterProps) => ({
    articleFragments: articlesFromIdsSelector(state, {
      articleFragmentIds
    })
  });
};

export default connect(createMapStateToProps)(GroupLevel);
