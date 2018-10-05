// @flow

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
/* eslint-disable import/no-duplicates */
import * as Guration from 'lib/guration';
/* eslint-enable import/no-duplicates */
import { type State } from 'types/State';
import { type Dispatch } from 'types/Store';
import {
  selectSharedState,
  createCollectionsAsTreeSelector
} from 'shared/selectors/shared';
// import { externalArticlesReceived } from 'shared/actions/ExternalArticles';
import { bindActionCreators } from 'redux';
import { addArticleFragment } from 'shared/actions/ArticleFragments';
import {
  insertArticleFragment,
  moveArticleFragment,
  updateArticleFragmentMeta
} from 'actions/ArticleFragments';
import { urlToArticle } from 'util/collectionUtils';
import type { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import type { ArticleFragmentMeta } from 'shared/types/Collection';
import Front from './CollectionComponents/Front';
import Collection from './CollectionComponents/Collection';
import Group from './CollectionComponents/Group';
import ArticleFragment from './CollectionComponents/ArticleFragment';
import Supporting from './CollectionComponents/Supporting';
import ArticleFragmentForm from './ArticleFragmentForm';

const FrontContainer = styled('div')`
  display: flex;
`;

const FrontContentContainer = styled('div')`
  max-height: 100%;
  overflow-y: scroll;
  padding-top: 1px;
`;

const FrontFormContainer = FrontContentContainer;

type FrontPropsBeforeState = {
  id: string,
  browsingStage: string,
  collectionIds: string[],
  alsoOn: { [string]: AlsoOnDetail }
};

type FrontProps = FrontPropsBeforeState & {
  tree: Object, // TODO add typings,
  addArticleFragment: (id: string, supporting: string[]) => Promise<string>,
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void,
  selectedArticleFragmentId: ?string,
  dispatch: Dispatch,
  selectArticleFragment: (id: string) => void,
  clearArticleFragmentSelection: () => void
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

  handleError = (error: string) => {
    this.setState({
      error
    });
  };

  runEdit = edit => {
    switch (edit.type) {
      case 'MOVE': {
        const {
          payload: { id, from, to }
        } = edit;
        return Promise.resolve(
          moveArticleFragment(
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
        const editsPromise = this.props
          .addArticleFragment(edit.payload.id, edit.meta.supporting)
          .then(uuid =>
            insertArticleFragment(
              parent.type, // the name of the level above
              parent.id,
              uuid,
              index
            )
          );
        return editsPromise;
      }
      default: {
        return null;
      }
    }
  };

  handleChange = edit => {
    const futureAction = this.runEdit(edit);
    if (!futureAction) {
      return;
    }
    futureAction.then(action => {
      if (action) {
        this.props.dispatch(action);
      }
    });
  };

  render() {
    const { selectedArticleFragmentId } = this.props;
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
        <FrontContainer>
          <FrontContentContainer>
            <Guration.Root
              // do we need frontId?
              id="frontId"
              type="front"
              onChange={this.handleChange}
              dedupeType="articleFragment"
              mapIn={{
                text: text => urlToArticle(text),
                capi: capi =>
                  Promise.resolve({ type: 'articleFragment', id: capi }),
                clipboard: str => JSON.parse(str),
                collection: str => JSON.parse(str) // other fronts
              }}
              mapOut={{
                collection: (el, type) =>
                  JSON.stringify({
                    type,
                    id: el.id,
                    meta: {
                      supporting: (el.meta.supporting || []).map(({ id }) => id)
                    }
                  })
              }}
            >
              <Front {...this.props.tree}>
                {collection => (
                  <Collection
                    {...collection}
                    alsoOn={this.props.alsoOn}
                    canPublish={this.props.browsingStage !== 'live'}
                    browsingStage={this.props.browsingStage}
                  >
                    {group => (
                      <Group {...group}>
                        {(articleFragment, afNodeProps) => (
                          <ArticleFragment
                            {...articleFragment}
                            parentId={group.uuid}
                            getNodeProps={afNodeProps}
                            onSelect={this.props.selectArticleFragment}
                            isSelected={
                              !selectedArticleFragmentId ||
                              selectedArticleFragmentId === articleFragment.uuid
                            }
                          >
                            {(supporting, sNodeProps) => (
                              <Supporting
                                {...supporting}
                                parentId={articleFragment.uuid}
                                getNodeProps={sNodeProps}
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
          </FrontContentContainer>
          <FrontFormContainer>
            {selectedArticleFragmentId && (
              <ArticleFragmentForm
                articleFragmentId={selectedArticleFragmentId}
                key={selectedArticleFragmentId}
                form={selectedArticleFragmentId}
                onSave={meta =>
                  this.props.updateArticleFragmentMeta(
                    selectedArticleFragmentId,
                    meta
                  )
                }
                onCancel={this.props.clearArticleFragmentSelection}
              />
            )}
          </FrontFormContainer>
        </FrontContainer>
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
    unpublishedChanges: state.unpublishedChanges,
    selectedArticleFragmentId: selectEditorArticleFragment(state, props.id)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
  ...bindActionCreators(
    { addArticleFragment, updateArticleFragmentMeta },
    dispatch
  ),
  selectArticleFragment: (frontId: string, articleFragmentId: string) =>
    dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

const mergeProps = (stateProps, dispatchProps, props) => ({
  ...props,
  ...stateProps,
  ...dispatchProps,
  selectArticleFragment: (articleId: string) =>
    dispatchProps.selectArticleFragment(props.id, articleId),
  clearArticleFragmentSelection: () =>
    dispatchProps.clearArticleFragmentSelection(props.id)
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FrontComponent);
