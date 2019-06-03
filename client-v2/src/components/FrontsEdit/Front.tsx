import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { moveArticleFragment } from 'actions/ArticleFragments';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import { AlsoOnDetail } from 'types/Collection';
import {
  editorSelectArticleFragment,
  editorOpenCollections,
  editorOpenOverview,
  editorCloseOverview,
  selectIsFrontOverviewOpen
} from 'bundles/frontsUIBundle';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import { events } from 'services/GA';
import FrontDetailView from './FrontDetailView';
import {
  initialiseCollectionsForFront,
  closeCollections
} from 'actions/Collections';
import { setFocusState } from 'bundles/focusBundle';
import Collection from './Collection';
import { DownCaretIcon } from 'shared/components/icons/Icons';
import { theme as sharedTheme } from 'shared/constants/theme';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import ButtonRoundedWithLabel from 'shared/components/input/ButtonRoundedWithLabel';

const FrontContainer = styled('div')`
  display: flex;
`;

const SectionContentMetaContainer = styled('div')`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  margin-right: 5px;
`;

const OverviewToggleContainer = styled('div')`
  font-size: 13px;
  font-weight: bold;
  padding-left: 10px;
  padding-top: 3px;
  border-left: ${({ theme }) =>
    `solid 1px  ${theme.shared.colors.greyVeryLight}`}
  padding-top: 13px;
`;

const OverviewHeading = styled('span')`
  margin-right: 5px;
`;

const CollapseAllButton = styled(ButtonRoundedWithLabel)`
  & svg {
    transform: rotate(180deg);
    vertical-align: middle;
  }
  :hover {
    background-color: ${({ theme }) =>
      theme.shared.base.colors.backgroundColorFocused};
  }
  margin-right: 10px;
  font-size: 12px;
  margin-bottom: 10px;
  margin-top: 10px;
`;

// min-height required here to display scrollbar in Firefox:
// https://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
const FrontContentContainer = styled('div')`
  height: 100%;
  min-height: 0;
`;

const FrontCollectionsContainer = styled('div')`
  overflow-y: scroll;
  max-height: calc(100% - 43px);
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
  toggleOverview: (open: boolean) => void;
  overviewIsOpen: boolean;
  closeAllCollections: (collections: string[]) => void;
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
            background: sharedTheme.base.colors.backgroundColorLight,
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
            <SectionContentMetaContainer>
              <CollapseAllButton
                onClick={e => {
                  e.preventDefault();
                  this.props.closeAllCollections(this.props.collectionIds);
                }}
                icon={<DownCaretIcon fill={sharedTheme.base.colors.text} />}
                label={'Collapse all'}
              />
              <OverviewToggleContainer>
                <OverviewHeading>
                  {this.props.overviewIsOpen ? 'Hide overview' : 'Overview'}
                </OverviewHeading>
                <ButtonCircularCaret
                  style={{
                    margin: '0'
                  }}
                  openDir="right"
                  active={this.props.overviewIsOpen}
                  preActive={false}
                  onClick={() =>
                    this.props.toggleOverview(!this.props.overviewIsOpen)
                  }
                  small={true}
                />
              </OverviewToggleContainer>
            </SectionContentMetaContainer>
            <FrontCollectionsContainer>
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
            </FrontCollectionsContainer>
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
    front: getFront(state, { frontId: props.id }),
    overviewIsOpen: selectIsFrontOverviewOpen(state, props.id)
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
      ),
    toggleOverview: (open: boolean) =>
      dispatch(
        open ? editorOpenOverview(props.id) : editorCloseOverview(props.id)
      ),
    closeAllCollections: (collections: string[]) =>
      dispatch(closeCollections(collections))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontComponent);
