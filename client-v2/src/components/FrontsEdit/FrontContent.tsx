import React from 'react';
import { styled, theme as globalTheme } from 'constants/theme';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import { events } from 'services/GA';
import { Root, PosSpec, Move } from 'lib/dnd';
import Collection from './Collection';
import { State } from 'types/State';
import WithDimensions from 'components/util/WithDimensions';
import { selectFront } from 'selectors/frontsSelectors';
import { Dispatch } from 'types/Store';
import {
  ArticleFragment as TArticleFragment,
  CollectionItemSets
} from 'shared/types/Collection';
import { FrontConfig } from 'types/FaciaApi';
import { moveArticleFragment } from 'actions/ArticleFragments';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import { bindActionCreators } from 'redux';
import { editorSelectArticleFragment } from 'bundles/frontsUIBundle';
import { initialiseCollectionsForFront } from 'actions/Collections';
import { createSelectAlsoOnFronts } from 'selectors/frontsSelectors';
import { AlsoOnDetail } from 'types/Collection';

const CollectionContainer = styled.div`
  position: relative;
  & + & {
    margin-top: 10px;
  }
`;

const FrontCollectionsContainer = styled.div`
  position: relative;
  overflow-y: scroll;
  max-height: calc(100% - 43px);
  padding-top: 1px;
  padding-bottom: ${({ theme }) => theme.front.paddingForAddFrontButton}px;
`;

const isDropFromCAPIFeed = (e: React.DragEvent) =>
  e.dataTransfer.types.includes('capi');

interface FrontPropsBeforeState {
  id: string;
  browsingStage: CollectionItemSets;
  handleArticleFocus: (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => void;
  onChangeCurrentCollectionId: (id: string) => void;
}

type FrontProps = FrontPropsBeforeState & {
  front: FrontConfig;
  alsoOn: { [id: string]: AlsoOnDetail };
  initialiseCollectionsForFront: (id: string, set: CollectionItemSets) => void;
  selectArticleFragment: (
    articleFragmentId: string,
    collectionId: string,
    frontId: string,
    isSupporting: boolean
  ) => void;
  moveArticleFragment: typeof moveArticleFragment;
  insertArticleFragmentFromDropEvent: typeof insertArticleFragmentFromDropEvent;
};

interface FrontState {
  currentlyScrolledCollectionId: string | undefined;
}

class FrontContent extends React.Component<FrontProps, FrontState> {
  public state = {
    currentlyScrolledCollectionId: undefined
  };
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
    const newCurrentCollectionId = sortedIdsAndOffsets[0][0];

    if (
      sortedIdsAndOffsets.length &&
      newCurrentCollectionId !== this.state.currentlyScrolledCollectionId
    ) {
      this.props.onChangeCurrentCollectionId(newCurrentCollectionId);
    }
  }, 100);

  public componentWillReceiveProps(newProps: FrontProps) {
    if (this.props.browsingStage !== newProps.browsingStage) {
      this.props.initialiseCollectionsForFront(
        this.props.id,
        this.props.browsingStage
      );
    }
  }

  public componentDidMount() {
    this.handleScroll();
    this.props.initialiseCollectionsForFront(
      this.props.id,
      this.props.browsingStage
    );
  }

  public handleMove = (move: Move<TArticleFragment>) => {
    events.dropArticle(this.props.id, 'collection');
    this.props.moveArticleFragment(
      move.to,
      move.data,
      move.from || null,
      'collection'
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    events.dropArticle(this.props.id, isDropFromCAPIFeed(e) ? 'feed' : 'url');
    this.props.insertArticleFragmentFromDropEvent(e, to, 'collection');
  };

  public render() {
    const { front } = this.props;
    return (
      <FrontCollectionsContainer
        onScroll={this.handleScroll}
        ref={ref => (this.collectionContainerElement = ref)}
      >
        <WithDimensions>
          {({ width }) => (
            <Root id={this.props.id} data-testid={this.props.id}>
              {front.collections.map(collectionId => (
                <CollectionContainer
                  key={collectionId}
                  ref={ref => (this.collectionElements[collectionId] = ref)}
                >
                  <Collection
                    id={collectionId}
                    frontId={this.props.id}
                    priority={front.priority}
                    browsingStage={this.props.browsingStage}
                    alsoOn={this.props.alsoOn}
                    handleInsert={this.handleInsert}
                    handleMove={this.handleMove}
                    size={
                      width && width > 750
                        ? 'wide'
                        : width && width > 500
                        ? 'default'
                        : 'medium'
                    }
                    selectArticleFragment={(articleFragmentId, isSupporting) =>
                      this.props.selectArticleFragment(
                        articleFragmentId,
                        collectionId,
                        this.props.id,
                        isSupporting
                      )
                    }
                    handleArticleFocus={this.props.handleArticleFocus}
                  />
                </CollectionContainer>
              ))}
            </Root>
          )}
        </WithDimensions>
      </FrontCollectionsContainer>
    );
  }
}

const mapStateToProps = () => {
  const selectAlsoOnFronts = createSelectAlsoOnFronts();
  return (state: State, { id }: FrontPropsBeforeState) => {
    return {
      front: selectFront(state, { frontId: id }),
      alsoOn: selectAlsoOnFronts(state, { frontId: id })
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      selectArticleFragment: editorSelectArticleFragment,
      initialiseCollectionsForFront,
      moveArticleFragment,
      insertArticleFragmentFromDropEvent
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontContent);
