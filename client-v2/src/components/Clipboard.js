// @flow

import { bindActionCreators } from 'redux';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Guration from '@guardian/guration';
import type { Edit } from '@guardian/guration';
import { type Dispatch } from 'types/Store';
import { batchActions } from 'redux-batched-actions';
import { type State } from 'types/State';
import { urlToArticle } from 'util/collectionUtils';
import { getMoveActions, getInsertActions } from 'util/clipboardUtils';
import { clipboardAsTreeSelector } from 'shared/selectors/shared';
import DropZone from 'components/DropZone';
import ArticlePolaroid from 'shared/components/ArticlePolaroid';
import { addArticleFragment } from 'shared/actions/ArticleFragments';

type ClipboardPropsBeforeState = {};

type ClipboardProps = ClipboardPropsBeforeState & {
  addArticleFragment: string => Promise<string>,
  tree: Object, // TODO add typing,
  dispatch: Dispatch
};

class Clipboard extends React.Component<ClipboardProps> {
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor
  runEdit = edit => {
    switch (edit.type) {
      case 'MOVE': {
        return Promise.resolve(getMoveActions(edit));
      }

      case 'INSERT': {
        const editsPromise = this.props
          .addArticleFragment(edit.payload.id)
          .then(uuid => {
            const payloadWithUuid = { ...edit.payload, id: uuid };
            const insertWithUuid = { ...edit, payload: payloadWithUuid };
            return getInsertActions(insertWithUuid);
          });
        return editsPromise;
      }
      default: {
        return null;
      }
    }
  };

  handleChange = (edit: Edit) => {
    const futureActions = this.runEdit(edit);
    if (!futureActions) {
      return;
    }
    futureActions.then(actions => {
      this.props.dispatch(
        batchActions(actions.filter(action => action !== null))
      );
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
            text: text => urlToArticle(text),
            capi: capi => ({ type: 'articleFragment', id: capi }),
            collection: str => JSON.parse(str)
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
            getDedupeKey={({ id }) => id}
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
