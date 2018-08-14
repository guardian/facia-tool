// @flow

import React from 'react';
import { connect } from 'react-redux';
/* eslint-disable import/no-duplicates */
import * as Guration from '@guardian/guration';
import { type Edit } from '@guardian/guration';
/* eslint-enable import/no-duplicates */
import { type State } from 'types/State';
import { type Dispatch } from 'types/Store';
import flatten from 'lodash/flatten';
import {
  selectSharedState,
  createCollectionsAsTreeSelector
} from 'shared/selectors/shared';
// import { externalArticlesReceived } from 'shared/actions/ExternalArticles';
import { bindActionCreators } from 'redux';
import { batchActions } from 'redux-batched-actions';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import {
  urlToArticle,
  getMoveActions,
  getInsertActions
} from 'util/collectionUtils';
import type { AlsoOnDetail } from 'types/Collection';
import Front from './CollectionComponents/Front';
import Collection from './CollectionComponents/Collection';
import Group from './CollectionComponents/Group';
import ArticleFragment from './CollectionComponents/ArticleFragment';
import Supporting from './CollectionComponents/Supporting';

type FrontPropsBeforeState = {
  browsingStage: string,
  collections: string[],
  alsoOn: { [string]: AlsoOnDetail },
  handleEdits: (edits: Edit[]) => void
};

type FrontProps = FrontPropsBeforeState & {
  tree: Object, // TODO add typings
  addArticleFragment: string => Promise<string>,
  dispatch: Dispatch
};

type FrontState = {
  error: ?string
};

class FrontComponent extends React.Component<FrontProps, FrontState> {
  constructor(props: FrontProps) {
    super(props);
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromProps({ tree }: FrontProps) {
    return {
      tree
    };
  }

  handleError = (error: string) => {
    this.setState({
      error
    });
  };

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
      this.props.dispatch(batchActions(flatten(actions)));
    });
  };

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            background: '#fff',
            display: this.state.error ? 'block' : 'none',
            padding: '1em',
            position: 'absolute',
            width: '100%'
          }}
        >
          {this.state.error}
        </div>
        <Guration.Root
          id={this.props.tree.id}
          type="front"
          onChange={this.handleChange}
          dropMappers={{
            text: text => urlToArticle(text),
            capi: capi => ({ type: 'articleFragment', id: capi })
          }}
        >
          <Front {...this.props.tree}>
            {collection => (
              <Collection {...collection} alsoOn={this.props.alsoOn}>
                {group => (
                  <Group {...group}>
                    {(articleFragment, afDragProps) => (
                      <ArticleFragment
                        {...articleFragment}
                        getDragProps={afDragProps}
                      >
                        {(supporting, sDragProps) => (
                          <Supporting
                            {...supporting}
                            getDragProps={sDragProps}
                          />
                        )}
                      </ArticleFragment>
                    )}
                  </Group>
                )}
              </Collection>
            )}
          </Front>
        </Guration.Root>
      </React.Fragment>
    );
  }
}

const createMapStateToProps = () => {
  const collectionsAsTreeSelector = createCollectionsAsTreeSelector();
  // $FlowFixMe factory redux :/
  return (state: State, props: FrontPropsBeforeState) => ({
    // TODO: fix object literal usage for memoization!
    tree: collectionsAsTreeSelector(selectSharedState(state), {
      stage: props.browsingStage,
      collectionIds: props.collectionIds
    }),
    unpublishedChanges: state.unpublishedChanges
  });
};

const mapDispatchToProps = (dispatch: *) => ({
  ...bindActionCreators({ addArticleFragment }, dispatch),
  dispatch
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(FrontComponent);
