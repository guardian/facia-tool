import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { handleMove, handleInsert } from 'util/collectionUtils';
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
import { ArticleFragment as TArticleFragment } from 'shared/types/Collection';
import ClipboardLevel from './clipboard/ClipboardLevel';
import ArticleFragmentLevel from './clipboard/ArticleFragmentLevel';

interface ClipboardProps {
  selectedArticleFragmentId: string | void;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: (id: string) => void;
  dispatch: Dispatch;
}

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor

  public handleMove = (move: Move<TArticleFragment>) => {
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
    return (
      <Root id="clipboard">
        <ClipboardLevel onMove={this.handleMove} onDrop={this.handleInsert}>
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
              <ArticleFragmentLevel
                articleFragmentId={articleFragment.uuid}
                onMove={this.handleMove}
                onDrop={this.handleInsert}
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
              </ArticleFragmentLevel>
            </ArticlePolaroid>
          )}
        </ClipboardLevel>
      </Root>
    );
  }
}

const mapStateToProps = (state: State) => ({
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
