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
import { DEFAULT_PARAMS } from 'services/faciaApi';
import ScrollContainer from './ScrollContainer';
import ClipboardHeader from 'components/ClipboardHeader';
import { media } from 'shared/util/mediaQueries';

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
  sortByParam: string;
}

const Title = styled.h1`
  position: relative;
  margin: 0 10px 0 0;
  padding-top: 2px;
  padding-right: 10px;
  vertical-align: top;
  font-family: TS3TextSans;
  font-weight: 500;
  font-size: 20px;
  min-width: 80px;
  ${media.large`
    min-width: 60px;
    font-size: 16px;
  `}
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
  flex-direction: row;
`;

const FixedContentContainer = styled.div`
  margin-bottom: 5px;
`;

const Sorters = styled('div')`
  display: flex;
  flex-direction: column;
`;

const TopOptions = styled('div')`
  display: flex;
  flex-direction: row;
`;

const SortByContainer = styled('div')`
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  font-size: 12px;
  > label {
    margin-right: 15px;
  }
`;

const getCapiFieldsToShow = (isPreview: boolean) => {
  const defaultFieldsToShow = DEFAULT_PARAMS['show-fields']
    .split(',')
    .filter(f => f !== 'scheduledPublicationDate')
    .join(',');

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
  isPreview: boolean,
  sortByParam: string
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
    : { 'order-by': 'newest', 'order-date': sortByParam })
});
class FeedsContainer extends React.Component<
  FeedsContainerProps,
  FeedsContainerState
> {
  public state = {
    capiFeedIndex: 0,
    displaySearchFilters: false,
    inputState: initState,
    displayPrevResults: false,
    sortByParam: 'first-publication'
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

  public sortResultsBy = (event: React.ChangeEvent<HTMLSelectElement>) =>
    this.setState({ sortByParam: event.target.value }, this.runSearch);

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
    const { livePagination, previewPagination } = this.props;
    const pagination = this.isLive ? livePagination : previewPagination;
    const hasPages = !!(pagination && pagination.totalPages > 1);
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
          <Sorters>
            <TopOptions>
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
            </TopOptions>
            <SortByContainer>
              <label htmlFor="sort-results">Sort by:</label>
              <select
                id="sort-results"
                onChange={this.sortResultsBy}
                value={this.state.sortByParam}
              >
                <option value="first-publication">First published</option>
                <option value="published">Latest published</option>
              </select>
            </SortByContainer>
          </Sorters>
        </ResultsHeadingContainer>
      </FixedContentContainer>
    );
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
        <ScrollContainer
          fixed={
            <>
              <SearchInput
                updateDisplaySearchFilters={this.updateDisplaySearchFilters}
                displaySearchFilters={this.state.displaySearchFilters}
                onUpdate={this.handleParamsUpdate}
                showReviewSearch={false}
                rightHandContainer={<ClipboardHeader />}
              />
              {!this.state.displaySearchFilters && this.renderFixedContent()}
            </>
          }
        >
          <Feed error={error} articles={articles} />
        </ScrollContainer>
      </FeedsContainerWrapper>
    );
  }

  private pageChange = (requestPage: number) => {
    const { inputState } = this.state;
    const searchTerm = inputState.query;
    const paginationParams = {
      ...getParams(searchTerm, inputState, false, this.state.sortByParam),
      page: requestPage
    };
    this.isLive
      ? this.props.fetchLive(paginationParams, false)
      : this.props.fetchPreview(paginationParams, false);
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
        getParams(searchTerm, inputState, false, this.state.sortByParam),
        !!maybeArticleId
      );
    } else {
      this.props.fetchPreview(
        getParams(searchTerm, inputState, true, this.state.sortByParam),
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
