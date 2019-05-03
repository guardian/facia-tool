import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { clipboardArticlesSelector } from 'selectors/clipboardSelectors';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag, { dragOffsetX, dragOffsetY } from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';
import { collectionDropTypeBlacklist } from 'constants/fronts';
import { styled } from 'constants/theme';

interface OuterProps {
  children: LevelChild<ArticleFragment>;
  onMove: MoveHandler<ArticleFragment>;
  onDrop: DropHandler;
}

interface InnerProps {
  articleFragments: ArticleFragment[];
}

type Props = OuterProps & InnerProps;

const ClipboardItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 140px;
`;

const ClipboardLevel = ({
  children,
  articleFragments,
  onMove,
  onDrop
}: Props) => (
  <Level
    containerElement={ClipboardItemContainer}
    blacklistedDataTransferTypes={collectionDropTypeBlacklist}
    arr={articleFragments}
    parentType="clipboard"
    parentId="clipboard"
    type="articleFragment"
    dragImageOffsetX={dragOffsetX}
    dragImageOffsetY={dragOffsetY}
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={(props, isTarget, isActive, index) => (
      <DropZone
        {...props}
        override={isTarget}
        disabled={!isActive}
        style={{
          flexBasis: '15px',
          flexGrow: articleFragments.length === index ? 1 : 0
        }}
      />
    )}
  >
    {children}
  </Level>
);

const mapStateToProps = (state: State) => ({
  articleFragments: clipboardArticlesSelector(state)
});

export default connect(mapStateToProps)(ClipboardLevel);
