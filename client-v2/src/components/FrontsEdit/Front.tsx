import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  removeArticleFragment,
  moveArticleFragment,
  addImageToArticleFragment
} from 'actions/ArticleFragments';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  editorOpenCollections
} from 'bundles/frontsUIBundle';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import Collection from './CollectionComponents/Collection';
import GroupDisplay from 'shared/components/GroupDisplay';
import ArticleFragmentLevel from 'components/clipboard/ArticleFragmentLevel';
import GroupLevel from 'components/clipboard/GroupLevel';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import { visibleFrontArticlesSelector } from 'selectors/frontsSelectors';
import { VisibleArticlesResponse } from 'types/FaciaApi';
import { initialiseFront } from 'actions/Fronts';
import { events } from 'services/GA';
import FrontDetailView from './FrontDetailView';
import CollectionItem from './CollectionComponents/CollectionItem';
import { ValidationResponse } from 'shared/util/validateImageSrc';

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
  dispatch: Dispatch;
  initialiseFront: () => void;
  selectArticleFragment: (id: string, isSupporting?: boolean) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (parentId: string, id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  editorOpenCollections: (ids: string[]) => void;
  addImageToArticleFragment: (id: string, response: ValidationResponse) => void;
  front: FrontConfig;
  articlesVisible: { [id: string]: VisibleArticlesResponse };
};

interface FrontState {
  error: string | void;
}

const isDropFromCAPIFeed = (e: React.DragEvent) =>
  e.dataTransfer.types.includes('capi');

class FrontComponent extends React.Component<FrontProps, FrontState> {
  constructor(props: FrontProps) {
    super(props);
    this.state = {
      error: undefined
    };
  }

  public componentWillMount() {
    this.props.initialiseFront();
  }

  public componentWillReceiveProps(newProps: FrontProps) {
    if (this.props.browsingStage !== newProps.browsingStage) {
      this.props.initialiseFront();
    }
  }

  public handleError = (error: string) => {
    this.setState({
      error
    });
  };

  public handleMove = (move: Move<TArticleFragment>) => {
    events.dropArticle(this.props.front.id, 'collection');
    this.props.dispatch(
      moveArticleFragment(move.to, move.data, move.from || null, 'collection')
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    events.dropArticle(
      this.props.front.id,
      isDropFromCAPIFeed(e) ? 'feed' : 'url'
    );
    this.props.dispatch(
      insertArticleFragmentFromDropEvent(e, to, 'collection')
    );
  };

  public render() {
    const { front, articlesVisible } = this.props;
    return (
      <React.Fragment>
        <div
          style={{
            background: theme.shared.base.colors.backgroundColorLight,
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
                    {(group, isUneditable) => (
                      <GroupDisplay key={group.uuid} groupName={group.name}>
                        <GroupLevel
                          isUneditable={isUneditable}
                          groupId={group.uuid}
                          onMove={this.handleMove}
                          onDrop={this.handleInsert}
                        >
                          {(articleFragment, afDragProps) => {
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
                                frontId={this.props.id}
                                onImageDrop={imageData => {
                                  this.props.addImageToArticleFragment(
                                    articleFragment.uuid,
                                    imageData
                                  );
                                }}
                                uuid={articleFragment.uuid}
                                parentId={group.uuid}
                                isUneditable={isUneditable}
                                getNodeProps={() =>
                                  !isUneditable ? afDragProps : {}
                                }
                                onSelect={this.props.selectArticleFragment}
                                onDelete={() =>
                                  this.props.removeCollectionItem(
                                    group.uuid,
                                    articleFragment.uuid
                                  )
                                }
                                articleNotifications={articleNotifications}
                              >
                                <ArticleFragmentLevel
                                  isUneditable={isUneditable}
                                  articleFragmentId={articleFragment.uuid}
                                  onMove={this.handleMove}
                                  onDrop={this.handleInsert}
                                >
                                  {(supporting, supportingDragProps) => (
                                    <CollectionItem
                                      frontId={this.props.id}
                                      uuid={supporting.uuid}
                                      parentId={articleFragment.uuid}
                                      onSelect={id =>
                                        this.props.selectArticleFragment(
                                          id,
                                          true
                                        )
                                      }
                                      isUneditable={isUneditable}
                                      getNodeProps={() =>
                                        !isUneditable ? supportingDragProps : {}
                                      }
                                      onDelete={() =>
                                        this.props.removeSupportingCollectionItem(
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
            <FrontDetailView
              id={this.props.id}
              browsingStage={this.props.browsingStage}
            />
          </FrontContentContainer>
        </FrontContainer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: State, props: FrontPropsBeforeState) => ({
  unpublishedChanges: state.unpublishedChanges,
  front: getFront(state, props.id),
  articlesVisible: visibleFrontArticlesSelector(state, {
    collectionSet: props.browsingStage
  })
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontPropsBeforeState
) => {
  return {
    dispatch,
    initialiseFront: () =>
      dispatch(initialiseFront(props.id, props.browsingStage)),
    selectArticleFragment: (
      frontId: string,
      articleFragmentId: string,
      isSupporting?: boolean
    ) =>
      dispatch(
        editorSelectArticleFragment(frontId, articleFragmentId, isSupporting)
      ),
    clearArticleFragmentSelection: (frontId: string) =>
      dispatch(editorClearArticleFragmentSelection(frontId)),
    removeCollectionItem: (parentId: string, uuid: string) => {
      dispatch(removeArticleFragment('group', parentId, uuid, 'collection'));
    },
    removeSupportingCollectionItem: (parentId: string, uuid: string) => {
      dispatch(
        removeArticleFragment('articleFragment', parentId, uuid, 'collection')
      );
    },
    editorOpenCollections: (ids: string[]) =>
      dispatch(editorOpenCollections(ids)),
    addImageToArticleFragment: (id: string, response: ValidationResponse) =>
      dispatch(addImageToArticleFragment(id, response))
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
  selectArticleFragment: (articleId: string, isSupporting?: boolean) =>
    dispatchProps.selectArticleFragment(props.id, articleId, isSupporting),
  clearArticleFragmentSelection: () =>
    dispatchProps.clearArticleFragmentSelection(props.id)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FrontComponent);
