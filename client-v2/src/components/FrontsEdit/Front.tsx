import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  insertArticleFragment,
  moveArticleFragment,
  updateArticleFragmentMeta,
  copyArticleFragment
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
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import Collection from './CollectionComponents/Collection';
import ArticleFragment from './CollectionComponents/ArticleFragment';
import Supporting from './CollectionComponents/Supporting';
import ArticleFragmentForm from './ArticleFragmentForm';
import GroupDisplay from 'shared/components/GroupDisplay';
import ArticleFragmentLevel from 'components/clipboard/ArticleFragmentLevel';
import GroupLevel from 'components/clipboard/GroupLevel';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';

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
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  selectedArticleFragmentId: string | void;
  dispatch: Dispatch;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: () => void;
  front: FrontConfig;
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

  public handleMove = (move: Move<TArticleFragment>) => {
    handleMove(
      moveArticleFragment,
      copyArticleFragment,
      this.props.dispatch,
      move
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    handleInsert(e, insertArticleFragment, this.props.dispatch, to);
  };

  public render() {
    const { selectedArticleFragmentId, front } = this.props;
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
              {front.collections.map(collectionId => (
                <Collection
                  key={collectionId}
                  id={collectionId}
                  frontId={this.props.id}
                  alsoOn={this.props.alsoOn}
                  canPublish={this.props.browsingStage !== 'live'}
                  browsingStage={this.props.browsingStage}
                >
                  {group => (
                    <GroupDisplay key={group.uuid} groupName={group.name}>
                      <GroupLevel
                        groupId={group.uuid}
                        onMove={this.handleMove}
                        onDrop={this.handleInsert}
                      >
                        {(articleFragment, afProps) => (
                          <ArticleFragment
                            uuid={articleFragment.uuid}
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
                            <ArticleFragmentLevel
                              articleFragmentId={articleFragment.uuid}
                              onMove={this.handleMove}
                              onDrop={this.handleInsert}
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
                            </ArticleFragmentLevel>
                          </ArticleFragment>
                        )}
                      </GroupLevel>
                    </GroupDisplay>
                  )}
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

const mapStateToProps = (state: State, props: FrontPropsBeforeState) => ({
  unpublishedChanges: state.unpublishedChanges,
  selectedArticleFragmentId: selectEditorArticleFragment(state, props.id),
  front: getFront(state, props.id)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateArticleFragmentMeta(id, meta)),
  selectArticleFragment: (frontId: string, articleFragmentId: string) =>
    dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

type StateProps = ReturnType<typeof mapStateToProps>;
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
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FrontComponent);
