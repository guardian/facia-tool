// @flow

import { bindActionCreators } from 'redux';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Guration from 'lib/guration';
import type { Edit } from 'lib/guration';
import { type Dispatch } from 'types/Store';
import { type State } from 'types/State';
import { urlToArticle } from 'util/collectionUtils';
import { clipboardAsTreeSelector } from 'shared/selectors/shared';
import DropZone from 'components/DropZone';
import ArticlePolaroid from 'shared/components/ArticlePolaroid';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import {
  insertClipboardArticleFragment,
  moveClipboardArticleFragment
} from 'actions/ArticleFragments';

type ClipboardPropsBeforeState = {};

type ClipboardProps = ClipboardPropsBeforeState & {
  addArticleFragment: (id: string, supporting: string[]) => Promise<string>,
  tree: Object, // TODO add typing,
  dispatch: Dispatch
};

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor
  runEdit = edit => {
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
            insertClipboardArticleFragment('clipboard', parent.id, uuid, index)
          );
      }
      default: {
        return null;
      }
    }
  };

  handleChange = (edit: Edit) => {
    const futureAction = this.runEdit(edit);
    if (!futureAction) {
      return;
    }
    futureAction.then(action => {
      this.props.dispatch(action);
    });
  };

  render() {
    const { tree } = this.props;
    return (
      <div>
        <Guration.Root
          id="clipboard"
          type="clipboard"
          dedupeType="articleFragment"
          onChange={this.handleChange}
          mapIn={{
            text: async text => urlToArticle(text),
            capi: capi =>
              Promise.resolve({ type: 'articleFragment', id: capi }),
            collection: str => Promise.resolve(JSON.parse(str))
          }}
          mapOut={{
            clipboard: (el, type) =>
              JSON.stringify({
                type,
                id: el.id
              })
          }}
        >
          <Guration.Level
            arr={tree.articleFragments || []}
            type="articleFragment"
            getKey={({ uuid }) => uuid}
            renderDrop={(getDropProps, { canDrop, isTarget }) => (
              <DropZone
                {...getDropProps()}
                override={!!canDrop && !!isTarget}
              />
            )}
          >
            {(articleFragment, getNodeProps) => (
              <ArticlePolaroid id={articleFragment.uuid} {...getNodeProps()} />
            )}
          </Guration.Level>
        </Guration.Root>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  tree: clipboardAsTreeSelector(state)
});

const mapDispatchToProps = (dispatch: *) => ({
  ...bindActionCreators({ addArticleFragment }, dispatch),
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clipboard);
