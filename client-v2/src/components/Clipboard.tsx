import { Dispatch } from 'types/Store';
import React from 'react';
import { connect, MergeProps } from 'react-redux';
import { Root, Level, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { handleMove, handleInsert } from 'util/collectionUtils';
import { ArticleFragmentTree } from 'shared/selectors/shared';
import {
  clipboardAsTreeSelector,
  ClipboardTree
} from 'selectors/clipboardSelectors';
import DropZone from 'components/DropZone';
import ArticlePolaroid from 'shared/components/ArticlePolaroid';
import ArticlePolaroidSub from 'shared/components/ArticlePolaroidSub';
import {
  insertClipboardArticleFragment,
  moveClipboardArticleFragment
} from 'actions/ArticleFragments';
import {
  editorSelectArticleFragment,
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { ArticleFragmentDenormalised } from 'shared/types/Collection';
import ArticleDrag from './FrontsEdit/CollectionComponents/ArticleDrag';

interface ClipboardProps {
  selectedArticleFragmentId: string | void;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: (id: string) => void;
  tree: ClipboardTree; // TODO add typing,
  dispatch: Dispatch;
}

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor

  public handleMove = (move: Move<ArticleFragmentDenormalised>) => {
    handleMove(
      moveClipboardArticleFragment,
      insertClipboardArticleFragment,
      this.props.dispatch,
      move
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    handleInsert(e, insertClipboardArticleFragment, this.props.dispatch, to);
  };

  public clearArticleFragmentSelectionIfNeeded = (articleId: string) => {
    if (articleId === this.props.selectedArticleFragmentId) {
      this.props.clearArticleFragmentSelection(clipboardId);
    }
  };

  public render() {
    const { tree } = this.props;
    return (
      <Root id="clipboard">
        <Level
          arr={tree.articleFragments}
          parentType="clipboard"
          parentId="clipboard"
          type="articleFragment"
          getId={({ uuid }) => uuid}
          onMove={this.handleMove}
          onDrop={this.handleInsert}
          renderDrag={af => <ArticleDrag id={af.uuid} />}
          renderDrop={(props, isTarget) => (
            <DropZone {...props} override={isTarget} />
          )}
        >
          {(articleFragment, afProps) => (
            <ArticlePolaroid
              id={articleFragment.uuid}
              onSelect={this.props.selectArticleFragment}
              isSelected={
                !this.props.selectedArticleFragmentId ||
                this.props.selectedArticleFragmentId === articleFragment.uuid
              }
              onDelete={this.clearArticleFragmentSelectionIfNeeded}
              {...afProps}
            >
              <Level
                arr={articleFragment.meta.supporting || []}
                parentType="articleFragment"
                parentId={articleFragment.uuid}
                type="articleFragment"
                getId={({ uuid }) => uuid}
                onMove={this.handleMove}
                onDrop={this.handleInsert}
                renderDrag={af => <ArticleDrag id={af.uuid} />}
                renderDrop={(props, isTarget) => (
                  <DropZone
                    {...props}
                    override={isTarget}
                    indicatorStyle={{
                      marginLeft: '20px'
                    }}
                  />
                )}
              >
                {(supporting, sProps) => (
                  <ArticlePolaroidSub
                    id={supporting.uuid}
                    parentId={articleFragment.uuid}
                    onSelect={this.props.selectArticleFragment}
                    isSelected={
                      !this.props.selectedArticleFragmentId ||
                      this.props.selectedArticleFragmentId === supporting.uuid
                    }
                    {...sProps}
                    onDelete={this.clearArticleFragmentSelectionIfNeeded}
                  />
                )}
              </Level>
            </ArticlePolaroid>
          )}
        </Level>
      </Root>
    );
  }
}

const mapStateToProps = (state: State) => ({
  tree: clipboardAsTreeSelector(state),
  selectedArticleFragmentId: selectEditorArticleFragment(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectArticleFragment: (frontId: string, articleFragmentId: string) =>
    dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId)),
  dispatch
});

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;

const mergeProps = (
  stateProps: TStateProps,
  dispatchProps: TDispatchProps
) => ({
  ...stateProps,
  ...dispatchProps,
  selectArticleFragment: (articleId: string) =>
    dispatchProps.selectArticleFragment(clipboardId, articleId)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Clipboard);
