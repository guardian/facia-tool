import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  updateArticleFragmentMeta,
  removeArticleFragment,
  moveArticleFragment
} from 'actions/ArticleFragments';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import {
  ArticleFragmentMeta,
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import Collection from './CollectionComponents/Collection';
import CollectionItem from './CollectionComponents/CollectionItem';
import ArticleFragmentForm from './ArticleFragmentForm';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import GroupDisplay from 'shared/components/GroupDisplay';
import ArticleFragmentLevel from 'components/clipboard/ArticleFragmentLevel';
import GroupLevel from 'components/clipboard/GroupLevel';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import { visibleFrontArticlesSelector } from 'selectors/frontsSelectors';
import { VisibleArticlesResponse } from 'types/FaciaApi';

const FrontContainer = styled('div')`
  display: flex;
`;

const FrontContentContainer = styled('div')`
  max-height: 100%;
  overflow-y: scroll;
  padding-top: 1px;
`;

interface FrontPropsBeforeState {
  id: string;
  browsingStage: CollectionItemSets;
  collectionIds: string[];
  alsoOn: { [id: string]: AlsoOnDetail };
}

type FrontProps = FrontPropsBeforeState & {
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  selectedArticleFragmentId: string | void;
  dispatch: Dispatch;
  selectArticleFragment: (id: string) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (parentId: string, id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  front: FrontConfig;
  articlesVisible: { [id: string]: VisibleArticlesResponse };
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

  public handleMove = (move: Move<TArticleFragment>) => {
    this.props.dispatch(
      moveArticleFragment(move.to, move.data, move.from || null, 'collection')
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    this.props.dispatch(
      insertArticleFragmentFromDropEvent(e, to, 'collection')
    );
  };

  public removeCollectionItem(parentId: string, id: string) {
    this.props.removeCollectionItem(parentId, id);
    this.clearArticleFragmentSelectionIfNeeded(id);
  }

  public removeSupportingCollectionItem(parentId: string, id: string) {
    this.props.removeSupportingCollectionItem(parentId, id);
    this.clearArticleFragmentSelectionIfNeeded(id);
  }

  public clearArticleFragmentSelectionIfNeeded(id: string) {
    if (id === this.props.selectedArticleFragmentId) {
      this.props.clearArticleFragmentSelection();
    }
  }

  public render() {
    const { selectedArticleFragmentId, front, articlesVisible } = this.props;
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
            <Root id={this.props.id} data-testid={this.props.id}>
              {front.collections.map(collectionId => {
                const collectionArticlesVisible =
                  articlesVisible && articlesVisible[collectionId];
                let collectionItemCount: number = 0;
                return (
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
                          {(articleFragment, afProps) => {
                            collectionItemCount += 1;
                            const articleNotifications: string[] = [];
                            if (
                              collectionArticlesVisible &&
                              collectionItemCount ===
                                collectionArticlesVisible.mobile
                            ) {
                              articleNotifications.push('mobile');
                            }
                            if (
                              collectionArticlesVisible &&
                              collectionItemCount ===
                                collectionArticlesVisible.desktop
                            ) {
                              articleNotifications.push('desktop');
                            }
                            return (
                              <CollectionItem
                                uuid={articleFragment.uuid}
                                parentId={group.uuid}
                                getNodeProps={() => afProps}
                                onSelect={this.props.selectArticleFragment}
                                onDelete={() =>
                                  this.removeCollectionItem(
                                    group.uuid,
                                    articleFragment.uuid
                                  )
                                }
                                isSelected={
                                  !selectedArticleFragmentId ||
                                  selectedArticleFragmentId ===
                                    articleFragment.uuid
                                }
                                articleNotifications={articleNotifications}
                              >
                                <ArticleFragmentLevel
                                  articleFragmentId={articleFragment.uuid}
                                  onMove={this.handleMove}
                                  onDrop={this.handleInsert}
                                >
                                  {(supporting, sProps) => (
                                    <CollectionItem
                                      uuid={supporting.uuid}
                                      parentId={articleFragment.uuid}
                                      getNodeProps={() => sProps}
                                      onSelect={
                                        this.props.selectArticleFragment
                                      }
                                      isSelected={
                                        !selectedArticleFragmentId ||
                                        selectedArticleFragmentId ===
                                          supporting.uuid
                                      }
                                      onDelete={() =>
                                        this.removeSupportingCollectionItem(
                                          articleFragment.uuid,
                                          supporting.uuid
                                        )
                                      }
                                      size="small"
                                    />
                                  )}
                                </ArticleFragmentLevel>
                              </CollectionItem>
                            );
                          }}
                        </GroupLevel>
                      </GroupDisplay>
                    )}
                  </Collection>
                );
              })}
            </Root>
          </FrontContentContainer>
          <FrontContentContainer>
            {selectedArticleFragmentId ? (
              <ArticleFragmentForm
                articleFragmentId={selectedArticleFragmentId}
                key={selectedArticleFragmentId}
                form={selectedArticleFragmentId}
                onSave={(meta: ArticleFragmentMeta) => {
                  this.props.updateArticleFragmentMeta(
                    selectedArticleFragmentId,
                    meta
                  );
                  this.props.clearArticleFragmentSelection();
                }}
                onCancel={this.props.clearArticleFragmentSelection}
              />
            ) : (
              <FrontCollectionsOverview
                id={this.props.id}
                browsingStage={this.props.browsingStage}
              />
          )}
          </FrontContentContainer>
        </FrontContainer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: State, props: FrontPropsBeforeState) => ({
  unpublishedChanges: state.unpublishedChanges,
  selectedArticleFragmentId: selectEditorArticleFragment(state, props.id),
  front: getFront(state, props.id),
  articlesVisible: visibleFrontArticlesSelector(state, {
    collectionSet: props.browsingStage
  })
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dispatch,
    updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
      dispatch(updateArticleFragmentMeta(id, meta)),
    selectArticleFragment: (frontId: string, articleFragmentId: string) =>
      dispatch(editorSelectArticleFragment(frontId, articleFragmentId)),
    clearArticleFragmentSelection: (frontId: string) =>
      dispatch(editorClearArticleFragmentSelection(frontId)),
    removeCollectionItem: (parentId: string, uuid: string) => {
      dispatch(removeArticleFragment('group', parentId, uuid, 'collection'));
    },
    removeSupportingCollectionItem: (parentId: string, uuid: string) => {
      dispatch(
        removeArticleFragment('articleFragment', parentId, uuid, 'collection')
      );
    }
  };
};

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
