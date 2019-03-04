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

interface FeedsContainerProps {
  fetchLive: (params: object, isResource: boolean) => void;
  fetchPreview: (params: object, isResource: boolean) => void;
  liveArticles: CapiArticle[];
  previewArticles: CapiArticle[];
  previewLoading: boolean;
  liveLoading: boolean;
  liveError: string | null;
  previewError: string | null;
}

interface FeedsContainerState {
  capiFeedIndex: number;
  displaySearchFilters: boolean;
  inputState: SearchInputState;
}

const Title = styled.h1`
  margin: 2px 0 0;
  vertical-align: top;
  font-family: GHGuardianHeadline-Medium;
  font-size: 20px;
  min-width: 80px;
`;

const RefreshButton = styled.button`
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

const StageSelectionContainer = styled('div')`
  margin-left: auto;
`;

const ResultsHeadingContainer = styled('div')`
  align-items: baseline;
  display: flex;
  margin-bottom: 10px;
`;

const getCapiFieldsToShow = (isPreview: boolean) => {
  const defaultFieldsToShow =
    'internalPageCode,trailText,firstPublicationDate,isLive';

  if (!isPreview) {
    return defaultFieldsToShow;
  }

  return defaultFieldsToShow + ',scheduledPublicationDate';
};

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
    inputState: initState
  };

  private interval: null | number = null;

  constructor(props: FeedsContainerProps) {
    super(props);
    this.debouncedRunSearchAndRestartPolling = debounce(
      () => this.runSearchAndRestartPolling(),
      250
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

  public renderFixedContent = () => {
    if (!this.state.displaySearchFilters) {
      return (
        <ResultsHeadingContainer>
          <Title>Latest</Title>
          <RefreshButton
            disabled={this.isLoading}
            onClick={() => this.runSearchAndRestartPolling()}
          >
            {this.isLoading ? 'Loading' : 'Refresh'}
          </RefreshButton>
          <StageSelectionContainer>
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
          </StageSelectionContainer>
        </ResultsHeadingContainer>
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

    return (
      <FeedsContainerWrapper>
        <SearchInput
          updateDisplaySearchFilters={this.updateDisplaySearchFilters}
          displaySearchFilters={this.state.displaySearchFilters}
          additionalFixedContent={this.renderFixedContent}
          onUpdate={this.handleParamsUpdate}
        >
          {this.state.capiFeedIndex === 0 ? (
            <Feed error={liveError} articles={liveArticles} />
          ) : (
            <Feed error={previewError} articles={previewArticles} />
          )}
        </SearchInput>
      </FeedsContainerWrapper>
    );
  }

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
  previewError: previewSelectors.selectCurrentError(state)
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
