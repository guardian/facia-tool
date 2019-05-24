import React from 'react';
import { styled, theme } from 'constants/theme';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { moveArticleFragment } from 'actions/ArticleFragments';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  editorOpenCollections
} from 'bundles/frontsUIBundle';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import { events } from 'services/GA';
import FrontDetailView from './FrontDetailView';
import { initialiseCollectionsForFront } from 'actions/Collections';
import { setFocusState } from 'bundles/focusBundle';
import Collection from './Collection';

// min-height required here to display scrollbar in Firefox:
// https://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
const FrontContainer = styled('div')`
  display: flex;
  min-height: 0;
  height: 100%;
`;

const FrontContentContainer = styled('div')`
  max-height: 100%;
  overflow-y: scroll;
  padding-top: 1px;
`;

const CollectionsContainer = styled(FrontContentContainer)`
  flex: 4 0 400px;
`;

const DetailContainer = styled(FrontContentContainer)`
  flex: 0 0 auto;
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
  selectArticleFragment: (
    frontId: string
  ) => (isSupporting?: boolean) => (id: string) => void;
  editorOpenCollections: (ids: string[]) => void;
  front: FrontConfig;
  handleArticleFocus: (
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => void;
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
    const { front } = this.props;
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
          <CollectionsContainer>
            <Root id={this.props.id} data-testid={this.props.id}>
              {front.collections.map(collectionId => (
                <Collection
                  key={collectionId}
                  id={collectionId}
                  frontId={this.props.id}
                  priority={front.priority}
                  browsingStage={this.props.browsingStage}
                  alsoOn={this.props.alsoOn}
                  handleInsert={this.handleInsert}
                  handleMove={this.handleMove}
                  selectArticleFragment={this.props.selectArticleFragment(
                    this.props.id
                  )}
                  handleArticleFocus={this.handleArticleFocus}
                />
              ))}
            </Root>
          </CollectionsContainer>
          <DetailContainer>
            <FrontDetailView
              id={this.props.id}
              browsingStage={this.props.browsingStage}
            />
          </DetailContainer>
        </FrontContainer>
      </React.Fragment>
    );
  }
  private handleArticleFocus = (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => {
    this.props.handleArticleFocus(groupId, articleFragment, frontId);
    e.stopPropagation();
  };
}

const mapStateToProps = (state: State, props: FrontPropsBeforeState) => {
  return {
    front: getFront(state, { frontId: props.id })
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontPropsBeforeState
) => {
  return {
    dispatch,
    initialiseFront: () =>
      dispatch(initialiseCollectionsForFront(props.id, props.browsingStage)),
    selectArticleFragment: (frontId: string) => (isSupporting?: boolean) => (
      articleFragmentId: string
    ) =>
      dispatch(
        editorSelectArticleFragment(frontId, articleFragmentId, isSupporting)
      ),
    editorOpenCollections: (ids: string[]) =>
      dispatch(editorOpenCollections(ids)),
    handleArticleFocus: (
      groupId: string,
      articleFragment: TArticleFragment,
      frontId: string
    ) =>
      dispatch(
        setFocusState({
          type: 'collectionArticle',
          groupId,
          articleFragment,
          frontId
        })
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontComponent);
