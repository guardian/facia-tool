import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Root, Level, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  selectSharedState,
  createCollectionsAsTreeSelector,
  ArticleFragmentTree,
  CollectionTree
} from 'shared/selectors/shared';
import {
  insertArticleFragment,
  moveArticleFragment,
  updateArticleFragmentMeta
} from 'actions/ArticleFragments';
import { handleMove, handleInsert } from 'util/collectionUtils';
import { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import {
  ArticleFragmentMeta,
  Stages,
  ArticleFragmentDenormalised
} from 'shared/types/Collection';
import DropZone from 'components/DropZone';
import Collection from './CollectionComponents/Collection';
import ArticleFragment from './CollectionComponents/ArticleFragment';
import Supporting from './CollectionComponents/Supporting';
import ArticleFragmentForm from './ArticleFragmentForm';
import GroupDisplayComponent from 'shared/components/GroupDisplay';
import ArticleDrag from './CollectionComponents/ArticleDrag';

const dropIndicatorStyle = {
  marginLeft: '83px'
};

const dropZoneStyle = {
  marginTop: '-15px',
  padding: '3px'
};

const FrontContainer = styled('div')`
  display: flex;
`;

const FrontContentContainer = styled('div')`
  max-height: 100%;
  overflow-y: scroll;
  padding-top: 1px;
`;

const FrontFormContainer = FrontContentContainer;

interface FrontPropsBeforeState {
  id: string;
  browsingStage: Stages;
  collectionIds: string[];
  alsoOn: { [id: string]: AlsoOnDetail };
}

type FrontProps = FrontPropsBeforeState & {
  tree: any;
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  selectedArticleFragmentId: string | void;
  dispatch: Dispatch;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: () => void;
};

interface FrontState {
  error: string | void;
}

class FrontComponent extends React.Component<FrontProps, FrontState> {
  constructor(props: FrontProps) {
    super(props);
    this.state = {
      error: undefined
    };
  }

  public handleError = (error: string) => {
    this.setState({
      error
    });
  };

  public clearArticleFragmentSelectionIfNeeded = (articleId: string) => {
    if (articleId === this.props.selectedArticleFragmentId) {
      this.props.clearArticleFragmentSelection();
    }
  };

  public handleMove = (move: Move<ArticleFragmentDenormalised>) => {
    handleMove(
      moveArticleFragment,
      insertArticleFragment,
      this.props.dispatch,
      move
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    handleInsert(e, insertArticleFragment, this.props.dispatch, to);
  };

  public render() {
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
          {this.state.error || ''}
        </div>
        <FrontContainer>
          <FrontContentContainer>
            <Root id={this.props.id}>
              {this.props.tree.collections.map((collection: CollectionTree) => (
                <Collection
                  key={collection.id}
                  id={collection.id}
                  frontId={this.props.id}
                  alsoOn={this.props.alsoOn}
                  canPublish={this.props.browsingStage !== 'live'}
                  browsingStage={this.props.browsingStage}
                >
                  {collection.groups.map(group => (
                    <GroupDisplayComponent
                      key={group.uuid}
                      groupName={group.id}
                    >
                      <Level
                        arr={group.articleFragments}
                        parentType="group"
                        parentId={group.uuid}
                        type="articleFragment"
                        getId={({ uuid }) => uuid}
                        onMove={this.handleMove}
                        onDrop={this.handleInsert}
                        renderDrag={af => <ArticleDrag id={af.uuid} />}
                        renderDrop={(props, isTarget) => (
                          <DropZone {...props} override={isTarget} />
                        )}
                      >
                        {(articleFragment, afProps) => (
                          <ArticleFragment
                            uuid={articleFragment.uuid}
                            supporting={articleFragment.meta.supporting}
                            parentId={group.uuid}
                            getNodeProps={() => afProps}
                            onSelect={this.props.selectArticleFragment}
                            onDelete={
                              this.clearArticleFragmentSelectionIfNeeded
                            }
                            isSelected={
                              !selectedArticleFragmentId ||
                              selectedArticleFragmentId === articleFragment.uuid
                            }
                          >
                            <Level
                              arr={articleFragment.meta.supporting || []}
                              parentType="articleFragment"
                              parentId={articleFragment.uuid}
                              type="articleFragment"
                              getId={({ uuid }) => uuid}
                              onMove={this.handleMove}
                              onDrop={this.handleInsert}
                              renderDrag={af => <ArticleDrag id={af.uuid} />}
                              renderDrop={(props, isTarget) => (
                                <DropZone
                                  {...props}
                                  override={isTarget}
                                  style={dropZoneStyle}
                                  indicatorStyle={dropIndicatorStyle}
                                />
                              )}
                            >
                              {(supporting, sProps) => (
                                <Supporting
                                  uuid={supporting.uuid}
                                  parentId={articleFragment.uuid}
                                  getNodeProps={() => sProps}
                                  onSelect={this.props.selectArticleFragment}
                                  isSelected={
                                    !selectedArticleFragmentId ||
                                    selectedArticleFragmentId ===
                                      supporting.uuid
                                  }
                                  onDelete={
                                    this.clearArticleFragmentSelectionIfNeeded
                                  }
                                />
                              )}
                            </Level>
                          </ArticleFragment>
                        )}
                      </Level>
                    </GroupDisplayComponent>
                  ))}
                </Collection>
              ))}
            </Root>
          </FrontContentContainer>
          {selectedArticleFragmentId && (
            <FrontFormContainer>
              <ArticleFragmentForm
                articleFragmentId={selectedArticleFragmentId}
                key={selectedArticleFragmentId}
                form={selectedArticleFragmentId}
                onSave={(meta: ArticleFragmentMeta) =>
                  this.props.updateArticleFragmentMeta(
                    selectedArticleFragmentId,
                    meta
                  )
                }
                onCancel={this.props.clearArticleFragmentSelection}
              />
            </FrontFormContainer>
          )}
        </FrontContainer>
      </React.Fragment>
    );
  }
}

const createMapStateToProps = () => {
  const collectionsAsTreeSelector = createCollectionsAsTreeSelector();
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
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateArticleFragmentMeta(id, meta)),
  selectArticleFragment: (frontId: string, articleFragmentId: string) =>
    dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

type StateProps = ReturnType<ReturnType<typeof createMapStateToProps>>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  props: FrontPropsBeforeState
) => ({
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
