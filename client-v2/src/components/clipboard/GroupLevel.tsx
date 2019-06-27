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
import { theme, styled } from 'constants/theme';

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

const Spacer = styled.div`
  margin-top: 10px;
`;

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
    canDrop={!isUneditable}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={
      isUneditable
        ? () => <Spacer />
        : (props, isTarget, isActive, i) => (
            <DropZone
              {...props}
              disabled={!isActive}
              override={isTarget}
              dropColor={theme.base.colors.dropZoneActiveStory}
              doubleHeight={!articleFragments.length || i === 0}
              style={
                i === 0
                  ? {
                      height: '32px',
                      marginTop: '-22px',
                      paddingTop: '22px'
                    }
                  : {}
              }
            />
          )
    }
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const selectArticlesFromIds = createSelectArticlesFromIds();
  return (state: State, { articleFragmentIds }: OuterProps) => ({
    articleFragments: selectArticlesFromIds(state, {
      articleFragmentIds
    })
  });
};

export default connect(createMapStateToProps)(GroupLevel);
