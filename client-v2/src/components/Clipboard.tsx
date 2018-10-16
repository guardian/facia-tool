import { Dispatch } from 'types/Store';
import React from 'react';
import { connect, MergeProps } from 'react-redux';
import * as Guration from 'lib/guration';
import { Edit } from 'lib/guration';
import { State } from 'types/State';
import { urlToArticle } from 'util/collectionUtils';
import {
  ArticleFragmentTree
} from 'shared/selectors/shared';
import {   clipboardAsTreeSelector, ClipboardTree } from 'selectors/clipboardSelectors';
import DropZone from 'components/DropZone';
import ArticlePolaroid from 'shared/components/ArticlePolaroid';
import ArticlePolaroidSub from 'shared/components/ArticlePolaroidSub';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import {
  insertClipboardArticleFragment,
  moveClipboardArticleFragment
} from 'actions/ArticleFragments';
import {
  editorSelectArticleFragment,
  selectEditorArticleFragment
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { ArticleFragmentDenormalised } from 'shared/types/Collection';

interface ClipboardProps {
  addArticleFragment: (id: string, supporting: string[]) => Promise<string>;
  selectedArticleFragmentId: string | void;
  selectArticleFragment: (id: string) => void;
  tree: ClipboardTree; // TODO add typing,
  dispatch: Dispatch;
};

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor
  public runEdit = (edit: Guration.Edit) => {
    switch (edit.type) {
      case 'MOVE': {
        const {
          payload: { id, from, to }
        } = edit;
        return Promise.resolve(
          moveClipboardArticleFragment(
            from.parent.type,
            from.parent.id,
            id,
            to.parent.type,
            to.parent.id,
            to.index
          )
        );
      }
      case 'INSERT': {
        const {
          payload: {
            path: { parent, index }
          }
        } = edit;
        return this.props
          .addArticleFragment(edit.payload.id, edit.meta.supporting)
          .then(uuid =>
            insertClipboardArticleFragment(parent.type, parent.id, uuid, index)
          );
      }
      default: {
        return null;
      }
    }
  };

  public handleChange = (edit: Edit) => {
    const futureAction = this.runEdit(edit);
    if (!futureAction) {
      return;
    }
    futureAction.then(action => {
      this.props.dispatch(action);
    });
  };

  public render() {
    const { tree } = this.props;
    return (
      <Guration.Root
        id="clipboard"
        type="clipboard"
        onChange={this.handleChange}
        mapIn={{
          text: async (text: string) => urlToArticle(text),
          capi: (capi: string) =>
            Promise.resolve({ type: 'articleFragment', id: capi }),
          collection: (str: string) => Promise.resolve(JSON.parse(str))
        }}
        mapOut={{
          // TODO: fix me, this is the same mapper for everything!
          // need to return a key and a payload instead of just a payload
          clipboard: (el: { id: string }, type) =>
            JSON.stringify({
              type,
              id: el.id
            })
        }}
      >
        <Guration.Level
          arr={tree.articleFragments}
          type="articleFragment"
          getKey={({ uuid }) => uuid}
          renderDrop={(getDropProps, { canDrop, isTarget }) => (
            <DropZone {...getDropProps()} override={!!canDrop && !!isTarget} />
          )}
        >
          {(
            articleFragment: ArticleFragmentTree,
            getArticleNodeProps: Guration.GetNodeProps
          ) => (
            <ArticlePolaroid
              id={articleFragment.uuid}
              onSelect={this.props.selectArticleFragment}
              {...getArticleNodeProps()}
            >
              <Guration.Level
                arr={articleFragment.meta.supporting || []}
                type="articleFragment"
                getKey={({ uuid }) => uuid}
                renderDrop={(getDropProps, { canDrop, isTarget }) => (
                  <DropZone
                    {...getDropProps()}
                    override={!!canDrop && !!isTarget}
                  />
                )}
              >
                {(
                  supporting: ArticleFragmentDenormalised,
                  getSupportingNodeProps: Guration.GetNodeProps
                ) => (
                  <ArticlePolaroidSub
                    id={supporting.uuid}
                    {...getSupportingNodeProps()}
                  />
                )}
              </Guration.Level>
            </ArticlePolaroid>
          )}
        </Guration.Level>
      </Guration.Root>
    );
  }
}

const mapStateToProps = (state: State) => ({
  tree: clipboardAsTreeSelector(state),
  selectedArticleFragmentId: selectEditorArticleFragment(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addArticleFragment: (id: string, supporting: string[]) =>
    dispatch(addArticleFragment(id, supporting)),
  selectArticleFragment: (frontId: string, articleFragmentId: string) =>
    dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
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
