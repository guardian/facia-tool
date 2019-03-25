import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import SearchInput, {
  SearchInputState,
  initState
} from './FrontsCAPIInterface/SearchInput';
import Feed from './FrontsCAPIInterface/Feed';
import { RadioButton, RadioGroup } from './inputs/RadioButtons';
import { State } from 'types/State';
import {
  liveSelectors,
  previewSelectors,
  fetchLive,
  fetchPreview
} from 'bundles/capiFeedBundle';
import { getTodayDate } from 'util/getTodayDate';
import { getIdFromURL } from 'util/CAPIUtils';
import { Dispatch } from 'types/Store';
import debounce from 'lodash/debounce';
import { CapiArticle } from 'types/Capi';
import Pagination from './FrontsCAPIInterface/Pagination';
import { IPagination } from 'lib/createAsyncResourceBundle';
import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';

interface FeedsContainerProps {
  fetchLive: (params: object, isResource: boolean) => void;
  fetchPreview: (params: object, isResource: boolean) => void;
  liveArticles: CapiArticle[];
  previewArticles: CapiArticle[];
  liveLoading: boolean;
  previewLoading: boolean;
  liveError: string | null;
  previewError: string | null;
  livePagination: IPagination | null;
  previewPagination: IPagination | null;
}

interface FeedsContainerState {
  capiFeedIndex: number;
  displaySearchFilters: boolean;
  inputState: SearchInputState;
  displayPrevResults: boolean;
}

const Title = styled.h1`
  position: relative;
  margin: 0 10px 0 0;
  padding-top: 2px;
  padding-right: 10px;
  vertical-align: top;
  font-family: GHGuardianHeadline;
  font-weight: 600;
  font-size: 20px;
  min-width: 80px;
`;

const RefreshButton = styled.button`
  padding-left: 0;
  appearance: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.shared.base.colors.text};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  outline: none;

  &:hover {
    color: ${({ theme }) => theme.shared.base.colors.buttonFocused};
  }

  &:disabled {
    color: ${({ theme }) => theme.shared.base.colors.textMuted};
  }
`;

const FeedsContainerWrapper = styled('div')`
  height: 100%;
`;

const PaginationContainer = styled('div')`
  margin-left: auto;
`;

const ResultsHeadingContainer = styled('div')`
  border-top: 1px solid ${({ theme }) => theme.shared.colors.greyVeryLight};
  align-items: baseline;
  display: flex;
  margin-bottom: 10px;
`;

const FixedContentContainer = styled.div`
  margin-bottom: 5px;
`;

const getCapiFieldsToShow = (isPreview: boolean) => {
  const defaultFieldsToShow =
    'internalPageCode,trailText,firstPublicationDate,isLive,thumbnail,secureThumbnail,liveBloggingNow';

  if (!isPreview) {
    return defaultFieldsToShow;
  }

  return defaultFieldsToShow + ',scheduledPublicationDate';
};

export type directionParam = 'from-date' | 'to-date';
const getParams = (
  query: string,
  {
    tags,
    sections,
    desks,
    ratings,
    toDate: to,
    fromDate: from
  }: SearchInputState,
  isPreview: boolean
) => ({
  q: query,
  tag: [...tags, ...desks].join(','),
  section: sections.join(','),
  'star-rating': ratings.join('|'),
  'from-date': from && from.format('YYYY-MM-DD'),
  'to-date': to && to.format('YYYY-MM-DD'),
  'page-size': '20',
  'show-elements': 'image',
  'show-tags': 'all',
  'show-fields': getCapiFieldsToShow(isPreview),
  ...(isPreview
    ? { 'order-by': 'oldest', 'from-date': getTodayDate() }
    : { 'order-by': 'newest', 'order-date': 'first-publication' })
});
class FeedsContainer extends React.Component<
  FeedsContainerProps,
  FeedsContainerState
> {
  public state = {
    capiFeedIndex: 0,
    displaySearchFilters: false,
    inputState: initState,
    displayPrevResults: false
  };

  private interval: null | number = null;

  constructor(props: FeedsContainerProps) {
    super(props);
    this.debouncedRunSearchAndRestartPolling = debounce(
      () => this.runSearchAndRestartPolling(),
      750
    );
  }

  public componentDidMount() {
    this.runSearchAndRestartPolling();
  }

  public componentWillUnmount() {
    this.stopPolling();
  }

  public handleParamsUpdate = (state: SearchInputState) => {
    this.setState(
      {
        inputState: state
      },
      () => this.debouncedRunSearchAndRestartPolling()
    );
  };

  public updateDisplaySearchFilters = (newValue: boolean) =>
    this.setState({
      displaySearchFilters: newValue
    });

  public handleFeedClick = (index: number) =>
    this.setState(
      {
        capiFeedIndex: index
      },
      this.runSearch
    );

  public get isLoading() {
    return (
      (this.state.capiFeedIndex === 0 && this.props.liveLoading) ||
      (this.state.capiFeedIndex === 1 && this.props.previewLoading)
    );
  }

  public get isLive() {
    return this.state.capiFeedIndex === 0;
  }

  public renderFixedContent = () => {
    if (!this.state.displaySearchFilters) {
      const { livePagination, previewPagination } = this.props;
      const pagination = this.isLive ? livePagination : previewPagination;
      const hasPages = !!(pagination && pagination.totalPages > 1); // TODO change this to total resutls / Action fix
      return (
        <FixedContentContainer>
          <ResultsHeadingContainer>
            <div>
              <Title>
                Latest
                <ShortVerticalPinline />
              </Title>
              <RefreshButton
                disabled={this.isLoading}
                onClick={() => this.runSearchAndRestartPolling()}
              >
                {this.isLoading ? 'Loading' : 'Refresh'}
              </RefreshButton>
            </div>
            <RadioGroup>
              <RadioButton
                checked={this.state.capiFeedIndex === 0}
                onChange={() => this.handleFeedClick(0)}
                label="Live"
                inline
                name="capiFeed"
              />
              <RadioButton
                checked={this.state.capiFeedIndex === 1}
                onChange={() => this.handleFeedClick(1)}
                label="Draft"
                inline
                name="capiFeed"
              />
            </RadioGroup>
            {pagination && hasPages && (
              <PaginationContainer>
                <Pagination
                  pageChange={this.pageChange}
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </PaginationContainer>
            )}
          </ResultsHeadingContainer>
        </FixedContentContainer>
      );
    }
    return null;
  };

  public render() {
    const {
      liveArticles,
      previewArticles,
      liveError,
      previewError
    } = this.props;
    const error = this.isLive ? liveError : previewError;
    const articles = this.isLive ? liveArticles : previewArticles;
    return (
      <FeedsContainerWrapper>
        <SearchInput
          updateDisplaySearchFilters={this.updateDisplaySearchFilters}
          displaySearchFilters={this.state.displaySearchFilters}
          additionalFixedContent={this.renderFixedContent}
          onUpdate={this.handleParamsUpdate}
        >
          <Feed error={error} articles={articles} />
        </SearchInput>
      </FeedsContainerWrapper>
    );
  }

  private pageChange = (requestPage: number) => {
    const { inputState } = this.state;
    const { capiFeedIndex } = this.state;
    const searchTerm = inputState.query;
    const paginationParams = {
      ...getParams(searchTerm, inputState, false),
      page: requestPage
    };
    if (capiFeedIndex === 0) {
      this.props.fetchLive(paginationParams, false);
    }
    if (requestPage > 1) {
      this.stopPolling();
    } else {
      this.runSearchAndRestartPolling();
    }
  };

  private runSearch() {
    const { inputState } = this.state;
    const { capiFeedIndex } = this.state;
    const maybeArticleId = getIdFromURL(inputState.query);
    const searchTerm = maybeArticleId ? maybeArticleId : inputState.query;
    if (capiFeedIndex === 0) {
      this.props.fetchLive(
        getParams(searchTerm, inputState, false),
        !!maybeArticleId
      );
    } else {
      this.props.fetchPreview(
        getParams(searchTerm, inputState, true),
        !!maybeArticleId
      );
    }
  }

  private runSearchAndRestartPolling() {
    this.stopPolling();
    this.interval = window.setInterval(() => this.runSearch(), 30000);
    this.runSearch();
  }

  private stopPolling() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  private debouncedRunSearchAndRestartPolling = () => {};
}

const mapStateToProps = (state: State) => ({
  liveArticles: liveSelectors.selectAll(state),
  previewArticles: previewSelectors.selectAll(state),
  liveLoading: liveSelectors.selectIsLoading(state),
  previewLoading: previewSelectors.selectIsLoading(state),
  liveError: liveSelectors.selectCurrentError(state),
  previewError: previewSelectors.selectCurrentError(state),
  livePagination: liveSelectors.selectPagination(state),
  previewPagination: previewSelectors.selectPagination(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchLive: (params: object, isResource: boolean) =>
    dispatch(fetchLive(params, isResource)),
  fetchPreview: (params: object, isResource: boolean) =>
    dispatch(fetchPreview(params, isResource))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedsContainer);
