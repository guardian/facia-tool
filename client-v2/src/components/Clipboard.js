// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import * as Guration from 'guration';
import { bindActionCreators } from 'redux';
import { type Dispatch } from 'types/Store';
import { batchActions } from 'redux-batched-actions';
import flatten from 'lodash/flatten';
import { type State } from 'types/State';
import { urlToArticle } from 'util/collectionUtils';
import { getMoveActions, getInsertActions } from 'util/clipboardUtils';
import { clipboardAsTreeSelector } from 'shared/selectors/shared';
import DropZone from 'components/DropZone';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import { fetchClipboardContent } from 'actions/Clipboard';
import { mapMoveEditToActions } from 'util/clipboardUtils';
import ArticlePolaroid from 'shared/components/ArticlePolaroid';

type ClipboardPropsBeforeState = {};

type ClipboardProps = ClipboardPropsBeforeState & {
  fetchClipboardContent: () => Promise<Array<String>>,
  addArticleFragment: string => Promise<string>,
  tree: Object, // TODO add typing,
  dispatch: Dispatch
};

class Clipboard extends React.Component<ClipboardProps> {
  componentDidMount() {
    this.props.fetchClipboardContent();
  }

  handleChange = edits => {
    const futureActions = edits.reduce((acc, edit) => {
      switch (edit.type) {
        case 'MOVE': {
          return [...acc, Promise.resolve(getMoveActions(edit))];
        }
        case 'INSERT': {
          const editsPromise = this.props
            .addArticleFragment(edit.payload.id)
            .then(uuid => {
              const payloadWithUuid = { ...edit.payload, id: uuid };
              const insertWithUuid = { ...edit, payload: payloadWithUuid };
              return getInsertActions(insertWithUuid);
            });
          return [...acc, editsPromise];
        }
        default: {
          return acc;
        }
      }
    }, []);
    Promise.all(futureActions).then(actions => {
      this.props.dispatch(
        batchActions(flatten(actions).filter(action => action !== null))
      );
    });
  };

  render() {
    const { tree } = this.props;
    const treeKeysExist = Object.keys(tree).length > 0;
    return (
      <div>
        {treeKeysExist && (
          <Guration.Root
            id="clipboard"
            type="clipboard"
            onChange={this.handleChange}
            dropMappers={{
              text: text => urlToArticle(text),
              capi: capi => ({ type: 'articleFragment', id: capi })
            }}
          >
            <Guration.Level
              arr={tree.articleFragments}
              type="articleFragment"
              getKey={({ uuid }) => uuid}
              renderDrop={props => <DropZone {...props} />}
            >
              {(articleFragment, afDragProps) => (
                <ArticlePolaroid
                  id={articleFragment.uuid}
                  getDragProps={afDragProps}
                />
              )}
            </Guration.Level>
          </Guration.Root>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  tree: clipboardAsTreeSelector(state)
});

const mapDispatchToProps = (dispatch: *) => ({
  ...bindActionCreators(
    { fetchClipboardContent, addArticleFragment },
    dispatch
  ),
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clipboard);
