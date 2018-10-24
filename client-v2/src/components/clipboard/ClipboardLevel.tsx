import React from 'react';
import { Level, LevelChild, MoveHandler, DropHandler } from 'lib/dnd';
import { State } from 'types/State';
import { clipboardArticlesSelector } from 'selectors/clipboardSelectors';
import { connect } from 'react-redux';
import { ArticleFragment } from 'shared/types/Collection';
import ArticleDrag from 'components/FrontsEdit/CollectionComponents/ArticleDrag';
import DropZone from 'components/DropZone';

interface OuterProps {
  children: LevelChild<ArticleFragment>;
  onMove: MoveHandler<ArticleFragment>;
  onDrop: DropHandler;
}

interface InnerProps {
  articleFragments: ArticleFragment[];
}

type Props = OuterProps & InnerProps;

const ClipboardLevel = ({
  children,
  articleFragments,
  onMove,
  onDrop
}: Props) => (
  <Level
    arr={articleFragments}
    parentType="clipboard"
    parentId="clipboard"
    type="articleFragment"
    getId={({ uuid }) => uuid}
    onMove={onMove}
    onDrop={onDrop}
    renderDrag={af => <ArticleDrag id={af.uuid} />}
    renderDrop={(props, isTarget) => (
      <DropZone {...props} override={isTarget} />
    )}
  >
    {children}
  </Level>
);

const mapStateToProps = (state: State) => ({
  articleFragments: clipboardArticlesSelector(state)
});

export default connect(mapStateToProps)(ClipboardLevel);
