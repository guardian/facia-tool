import React from 'react';
import { styled, theme as globalTheme } from 'constants/theme';
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
  selectIsFrontOverviewOpen,
  selectEditorArticleFragment,
  editorCloseCollections
} from 'bundles/frontsUIBundle';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import { selectFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import { events } from 'services/GA';
import FrontDetailView from './FrontDetailView';
import {
  initialiseCollectionsForFront,
  openCollectionsAndFetchTheirArticles
} from 'actions/Collections';
import { setFocusState } from 'bundles/focusBundle';
import Collection from './Collection';
import { DownCaretIcon } from 'shared/components/icons/Icons';
import { theme as sharedTheme } from 'shared/constants/theme';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import ButtonRoundedWithLabel, {
  ButtonLabel
} from 'shared/components/input/ButtonRoundedWithLabel';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';

const FrontContainer = styled('div')`
  height: 100%;
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
    `solid 1px  ${theme.shared.colors.greyVeryLight}`};
  padding-top: 13px;
`;

const OverviewHeading = styled('label')`
  margin-right: 5px;
  cursor: pointer;
`;

const CollectionContainer = styled.div`
  position: relative;
`;

const OverviewHeadingButton = styled(ButtonRoundedWithLabel)`
  & svg {
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
const BaseFrontContentContainer = styled('div')`
  height: 100%;
  min-height: 0;
  /* Min-width is set to allow content within this container to shrink completely */
  min-width: 0;
`;

const FrontContentContainer = styled(BaseFrontContentContainer)`
  width: 100%;
`;

const FrontDetailContainer = styled(BaseFrontContentContainer)`
  /* We don't want to shrink our overview or form any smaller than the containing content */
  flex-shrink: 0;
`;

const FrontCollectionsContainer = styled('div')`
  position: relative;
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
  formIsOpen: boolean;
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
  openAllCollections: (collections: string[]) => void;
};

interface FrontState {
  error: string | void;
  currentlyScrolledCollectionId: string | undefined;
}

const isDropFromCAPIFeed = (e: React.DragEvent) =>
  e.dataTransfer.types.includes('capi');

class FrontComponent extends React.Component<FrontProps, FrontState> {
  private collectionElements: {
    [collectionId: string]: HTMLDivElement | null;
  } = {};
  private collectionContainerElement: HTMLDivElement | null = null;

  /**
   * Handle a scroll event. We debounce this as it's called many times by the
   * event handler, and triggers an expensive rerender.
   */
  private handleScroll = debounce(() => {
    if (!this.collectionContainerElement) {
      return;
    }
    const scrollTop = this.collectionContainerElement.scrollTop;
    const currentIdsAndOffsets = Object.entries(this.collectionElements)
      .filter(
        ([_, element]) =>
          // We filter everything that comes before the collection here, as we
          // know we won't need it. The constant here refers to the height of
          // the container heading.
          !!element &&
          element.offsetTop +
            element.clientHeight -
            globalTheme.layout.sectionHeaderHeight >
            scrollTop
      )
      .map(([id, element]) => [id, element!.offsetTop] as [string, number]);

    const sortedIdsAndOffsets = sortBy(
      currentIdsAndOffsets,
      ([_, offset]) => offset
    );

    if (sortedIdsAndOffsets.length) {
      this.setState({
        currentlyScrolledCollectionId: sortedIdsAndOffsets[0][0]
      });
    }
  }, 100);

  constructor(props: FrontProps) {
    super(props);
    this.state = {
      error: undefined,
      currentlyScrolledCollectionId: undefined
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

  public componentDidMount() {
    this.handleScroll();
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
    const { front, overviewIsOpen, formIsOpen } = this.props;
    const overviewToggleId = `btn-overview-toggle-${this.props.id}`;
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
              <OverviewHeadingButton
                onClick={e => {
                  e.preventDefault();
                  this.props.openAllCollections(this.props.collectionIds);
                }}
              >
                <ButtonLabel>Expand all&nbsp;</ButtonLabel>
                <DownCaretIcon fill={sharedTheme.base.colors.text} />
              </OverviewHeadingButton>
              <OverviewHeadingButton
                onClick={e => {
                  e.preventDefault();
                  this.props.closeAllCollections(this.props.collectionIds);
                }}
              >
                <ButtonLabel>Collapse all&nbsp;</ButtonLabel>
                <DownCaretIcon
                  direction="up"
                  fill={sharedTheme.base.colors.text}
                />
              </OverviewHeadingButton>
              <OverviewToggleContainer>
                <OverviewHeading htmlFor={overviewToggleId}>
                  {this.props.overviewIsOpen ? 'Hide overview' : 'Overview'}
                </OverviewHeading>
                <ButtonCircularCaret
                  id={overviewToggleId}
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
            <FrontCollectionsContainer
              onScroll={this.handleScroll}
              innerRef={ref => (this.collectionContainerElement = ref)}
            >
              <Root id={this.props.id} data-testid={this.props.id}>
                {front.collections.map(collectionId => (
                  <CollectionContainer
                    key={collectionId}
                    innerRef={ref =>
                      (this.collectionElements[collectionId] = ref)
                    }
                  >
                    <Collection
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
                  </CollectionContainer>
                ))}
              </Root>
            </FrontCollectionsContainer>
          </FrontContentContainer>
          {(overviewIsOpen || formIsOpen) && (
            <FrontDetailContainer>
              <FrontDetailView
                id={this.props.id}
                browsingStage={this.props.browsingStage}
                currentCollection={this.state.currentlyScrolledCollectionId}
              />
            </FrontDetailContainer>
          )}
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

const mapStateToProps = (state: State, { id }: FrontPropsBeforeState) => {
  return {
    front: selectFront(state, { frontId: id }),
    overviewIsOpen: selectIsFrontOverviewOpen(state, id),
    formIsOpen: !!selectEditorArticleFragment(state, id)
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { id, browsingStage }: FrontPropsBeforeState
) => {
  return {
    dispatch,
    initialiseFront: () =>
      dispatch(initialiseCollectionsForFront(id, browsingStage)),
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
      dispatch(open ? editorOpenOverview(id) : editorCloseOverview(id)),
    closeAllCollections: (collections: string[]) =>
      dispatch(editorCloseCollections(collections)),
    openAllCollections: (collections: string[]) =>
      dispatch(openCollectionsAndFetchTheirArticles(collections, browsingStage))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontComponent);
