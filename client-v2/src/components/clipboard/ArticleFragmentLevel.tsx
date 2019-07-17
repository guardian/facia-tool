import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag, {
  dragOffsetX,
  dragOffsetY
} from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone, {
  DefaultDropContainer,
  DefaultDropIndicator
} from 'components/DropZone';
import { createSelectSupportingArticles } from 'shared/selectors/shared';
import { collectionDropTypeBlacklist } from 'constants/fronts';
import { theme, styled } from 'constants/theme';

interface OuterProps {
  articleFragmentId: string;
  children: LevelChild<ArticleFragment>;
  onMove: MoveHandler<ArticleFragment>;
  onDrop: DropHandler;
  isUneditable?: boolean;
}

interface InnerProps {
  supporting: ArticleFragment[];
}

type Props = OuterProps & InnerProps;

const ArticleFragmentDropContainer = styled(DefaultDropContainer)`
  margin-top: -30px;
  margin-left: 80px;
  height: 30px;
`;

const ArticleFragmentDropIndicator = styled(DefaultDropIndicator)`
  position: absolute;
  width: 100%;
  bottom: 0px;
`;

const ArticleFragmentLevel = ({
  children,
  articleFragmentId,
  supporting,
  onMove,
  onDrop,
  isUneditable
}: Props) => (
  <Level
    arr={supporting || []}
    blacklistedDataTransferTypes={collectionDropTypeBlacklist}
    parentType="articleFragment"
    parentId={articleFragmentId}
    type="articleFragment"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    canDrop={!isUneditable}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    renderDrop={
      isUneditable
        ? null
        : (props, isTarget, isActive) => (
            <DropZone
              {...props}
              disabled={!isActive}
              override={isTarget}
              dropColor={theme.base.colors.dropZoneActiveSublink}
              dropMessage={'Sublink'}
              dropContainer={ArticleFragmentDropContainer}
              dropIndicator={ArticleFragmentDropIndicator}
            />
          )
    }
  >
    {children}
  </Level>
);

const createMapStateToProps = () => {
  const selectSupportingArticles = createSelectSupportingArticles();
  return (state: State, { articleFragmentId }: OuterProps) => ({
    supporting: selectSupportingArticles(state, { articleFragmentId })
  });
};

export default connect(createMapStateToProps)(ArticleFragmentLevel);
