import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag, { dragOffsetX, dragOffsetY } from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { createGroupArticlesSelector } from 'shared/selectors/shared';
import { collectionDropTypeBlacklist } from 'constants/fronts';

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
              style={
                // Pad the drop zone for ease of dropping if there's
                // nothing in the group.
                articleFragments.length
                  ? undefined
                  : {
                      height: '30px',
                      paddingBottom: '20px'
                    }
              }
            />
          )
    }
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
