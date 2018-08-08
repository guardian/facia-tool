// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import * as Guration from 'guration';
import { bindActionCreators } from 'redux';
import { type Dispatch } from 'types/Store';
import styled from 'styled-components';
import { batchActions } from 'redux-batched-actions';
import { fetchClipboardContent } from 'actions/Clipboard';
import { type State } from 'types/State';
import { urlToArticle } from 'util/collectionUtils';
import { clipboardAsTreeSelector } from 'shared/selectors/shared';
import ArticleFragment from 'components/FrontsEdit/CollectionComponents/ArticleFragment';
import Supporting from 'components/FrontsEdit/CollectionComponents/Supporting';
import DropZone from 'components/DropZone';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import {
  mapMoveEditToActions,
  mapMoveInsertToActions
} from 'util/clipboardUtils';

type ClipboardPropsBeforeState = {};

type ClipboardProps = ClipboardPropsBeforeState & {
  fetchClipboardContent: () => Promise<Array<String>>,
  addArticleFragment: string => string,
  tree: Object, // TODO add typing,
  dispatch: Dispatch
};

const ClipboardContent = styled(`div`)`
  background: white
  color: black
  padding: 5px
`;

const ClipboardContainer = styled(`div`)`
  padding: 5px;
`;

class Clipboard extends React.Component<ClipboardProps> {
  componentDidMount() {
    this.props.fetchClipboardContent();
  }

  handleChange = edits => {
    const actions = edits.reduce((acc, edit) => {
      switch (edit.type) {
        case 'MOVE': {
          return [...acc, ...mapMoveEditToActions(edit)];
        }
        case 'INSERT': {
          const uuid = this.props.addArticleFragment(edit.payload.id);
          const payloadWithUuid = { ...edit.payload, id: uuid };
          const insertWithUuid = { ...edit, payload: payloadWithUuid };
          return [...acc, ...mapMoveInsertToActions(insertWithUuid)];
        }
        default: {
          return acc;
        }
      }
    }, []);

    this.props.dispatch(batchActions(actions));
  };

  render() {
    const { tree } = this.props;
    const treeKeysExist = Object.keys(tree).length > 0;
    return (
      <ClipboardContainer>
        Clipboard
        {treeKeysExist && (
          <ClipboardContent>
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
                  <ArticleFragment
                    {...articleFragment}
                    getDragProps={afDragProps}
                  >
                    {(supporting, sDragProps) => (
                      <Supporting {...supporting} getDragProps={sDragProps} />
                    )}
                  </ArticleFragment>
                )}
              </Guration.Level>
            </Guration.Root>
          </ClipboardContent>
        )}
      </ClipboardContainer>
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
