import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { handleMove, handleInsert } from 'util/collectionUtils';
import {
  insertClipboardArticleFragment,
  moveClipboardArticleFragment,
  copyClipboardArticleFragment,
  removeArticleFragmentFromClipboard,
  removeSupportingArticleFragmentFromClipboard
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
import CollectionItem from './FrontsEdit/CollectionComponents/CollectionItem';

interface ClipboardProps {
  selectedArticleFragmentId: string | void;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  dispatch: Dispatch;
}

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor

  public handleMove = (move: Move<TArticleFragment>) => {
    handleMove(
      moveClipboardArticleFragment,
      copyClipboardArticleFragment,
      this.props.dispatch,
      move
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    handleInsert(e, insertClipboardArticleFragment, this.props.dispatch, to);
  };

  public removeCollectionItem = (id: string) => {
    this.props.removeCollectionItem(id);
    this.clearArticleFragmentSelectionIfNeeded(id);
  }

  public removeSupportingCollectionItem = (parentId: string, id: string) => {
    this.props.removeSupportingCollectionItem(parentId, id);
    this.clearArticleFragmentSelectionIfNeeded(id);
  }

  public clearArticleFragmentSelectionIfNeeded = (id: string) => {
    if (id === this.props.selectedArticleFragmentId) {
      this.props.clearArticleFragmentSelection();
    }
  };

  public render() {
    return (
      <Root
        id="clipboard"
        data-testid="clipboard"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <ClipboardLevel onMove={this.handleMove} onDrop={this.handleInsert}>
          {(articleFragment, afProps) => (
            <CollectionItem
              uuid={articleFragment.uuid}
              parentId={clipboardId}
              getNodeProps={() => afProps}
              displayType="polaroid"
              onSelect={this.props.selectArticleFragment}
              isSelected={
                !this.props.selectedArticleFragmentId ||
                this.props.selectedArticleFragmentId === articleFragment.uuid
              }
              onDelete={() => this.removeCollectionItem(articleFragment.uuid)}
              {...afProps}
            >
              <ArticleFragmentLevel
                articleFragmentId={articleFragment.uuid}
                onMove={this.handleMove}
                onDrop={this.handleInsert}
              >
                {(supporting, sProps) => (
                  <CollectionItem
                    uuid={supporting.uuid}
                    parentId={articleFragment.uuid}
                    getNodeProps={() => sProps}
                    size="small"
                    displayType="polaroid"
                    onSelect={this.props.selectArticleFragment}
                    isSelected={
                      !this.props.selectedArticleFragmentId ||
                      this.props.selectedArticleFragmentId === supporting.uuid
                    }
                    {...sProps}
                    onDelete={() =>
                      this.removeSupportingCollectionItem(
                        articleFragment.uuid,
                        supporting.uuid
                      )
                    }
                  />
                )}
              </ArticleFragmentLevel>
            </CollectionItem>
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
  clearArticleFragmentSelection: () =>
    dispatch(editorClearArticleFragmentSelection(clipboardId)),
  removeCollectionItem: (uuid: string) => {
    dispatch(removeArticleFragmentFromClipboard(uuid));
  },
  removeSupportingCollectionItem: (parentId: string, uuid: string) => {
    dispatch(removeSupportingArticleFragmentFromClipboard(parentId, uuid));
  },
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
