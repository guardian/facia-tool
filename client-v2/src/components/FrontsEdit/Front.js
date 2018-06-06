// @flow

import React from 'react';
import { connect } from 'react-redux';
/* eslint-disable import/no-duplicates */
import * as Guration from 'guration';
import { type Edit, type Move } from 'guration';
/* eslint-enable import/no-duplicates */
import { type State } from 'types/State';
import { type Dispatch } from 'types/Store';
import {
  selectSharedState,
  createCollectionsAsTreeSelector
} from 'shared/selectors/shared';
import {
  removeCollectionArticleFragment,
  addCollectionArticleFragment
} from 'shared/actions/Collection';
import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment
} from 'shared/actions/ArticleFragments';
// import { externalArticlesReceived } from 'shared/actions/ExternalArticles';
import { batchActions } from 'redux-batched-actions';
import { urlToArticle } from 'util/collectionUtils';
import type { AlsoOnDetail } from 'types/Collection';
import Front from './CollectionComponents/Front';
import Collection from './CollectionComponents/Collection';
import Group from './CollectionComponents/Group';
import ArticleFragment from './CollectionComponents/ArticleFragment';
import Supporting from './CollectionComponents/Supporting';

type FrontProps = {
  tree: Object,
  handleEdits: (edits: Edit[]) => void,
  alsoOn: { [string]: AlsoOnDetail },
  browsingStage: string,
  dispatch: Dispatch
};

type FrontState = {
  tree: Object,
  error: ?string
};

class FrontComponent extends React.Component<FrontProps, FrontState> {
  constructor(props: FrontProps) {
    super(props);
    this.state = {
      tree: this.props.tree,
      error: null
    };
  }

  static getDerivedStateFromProps({ tree }: FrontProps) {
    return {
      tree
    };
  }

  handleChange = () =>
    this.setState({
      error: null
    });

  handleError = (error: string) => {
    this.setState({
      error
    });
  };

  handleChange = edits => {
    const { browsingStage } = this.props;

    // TODO: tidy this

    const fromMap = {
      articleFragment: {
        articleFragment: ({ payload: { id, from } }: Move) =>
          removeSupportingArticleFragment(from.parent.id, id),
        collection: ({ payload: { id, from } }: Move) =>
          removeCollectionArticleFragment(from.parent.id, id, browsingStage)
      }
    };

    const toMap = {
      articleFragment: {
        articleFragment: ({ payload: { id, to } }: Move) =>
          addSupportingArticleFragment(to.parent.id, id, to.index),
        collection: ({ payload: { id, to } }: Move) =>
          addCollectionArticleFragment(
            to.parent.id,
            id,
            to.index,
            browsingStage
          )
      }
    };

    const editMap = {
      MOVE: edit => [
        fromMap[edit.payload.type][edit.payload.from.parent.type](edit),
        toMap[edit.payload.type][edit.payload.to.parent.type](edit)
      ]
    };

    const actions = edits.reduce((acc, edit) => {
      switch (edit.type) {
        case 'MOVE': {
          return [...acc, ...editMap.MOVE(edit)];
        }
        default: {
          return acc;
        }
      }
    }, []);

    this.props.dispatch(batchActions(actions, 'MOVE'));
  };

  handleArticleInsert = edit => {
    console.log(edit);
    // this.props.dispatch(
    //   batchActions(
    //     [
    //       externalArticlesReceived({
    //         [edit.payload.data.id]: edit.payload.data
    //       })
    //     ],
    //     'ARTICLE_DROP'
    //   )
    // );
  };

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            background: '#221133',
            display: this.state.error ? 'block' : 'none',
            padding: '1em',
            position: 'absolute',
            width: '100%'
          }}
        >
          {this.state.error}
        </div>
        <Guration.Root
          onChange={this.handleChange}
          dropMappers={{
            text: text => urlToArticle(text)
          }}
        >
          <Front {...this.state.tree}>
            {(collection, i) => (
              <Collection {...collection} alsoOn={this.props.alsoOn} index={i}>
                {(group, j) => (
                  <Group {...group} index={j}>
                    {(articleFragment, k) => (
                      <ArticleFragment {...articleFragment} index={k}>
                        {(supporting, l) => (
                          <Supporting {...supporting} index={l} />
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
  return (state: State, props) => ({
    // TODO: fix object literal usage for memoization!
    tree: collectionsAsTreeSelector(selectSharedState(state), {
      stage: props.browsingStage,
      collectionIds: props.front.collections
    })
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

export default connect(createMapStateToProps, mapDispatchToProps)(
  FrontComponent
);
