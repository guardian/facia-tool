import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import { capiFeedSpecsSelector } from '../selectors/configSelectors';
import { RadioButton, RadioGroup } from './inputs/RadioButtons';
import { State } from 'types/State';
import { CapiArticle } from 'types/Capi';
import { liveSelectors, previewSelectors } from 'bundles/capiFeedBundle';

interface FeedSpec {
  name: string;
  baseUrl: string;
}

interface FeedProps {
  capiFeedSpecs: FeedSpec[];
  capiFeedLiveArticles: CapiArticle[];
  capiFeedPreviewArticles: CapiArticle[];
  previewLoading: boolean;
  liveLoading: boolean;
  liveError: string | null;
  previewError: string | null;
}

interface FeedState {
  capiFeedIndex: number;
  displaySearchFilters: boolean;
}

interface ErrorDisplayProps {
  error: string | null;
  children: React.ReactNode;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? <div>{error}</div> : <>{children}</>;

interface LoaderDisplayProps {
  children: React.ReactNode;
  loading: boolean;
}

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <div>Loading!</div> : <>{children}</>;

const FeedContainer = styled('div')`
  height: 100%;
`;

const NoResults = styled('div')`
  margin: 4px;
`;

const StageSelectionContainer = styled('div')`
  margin-left: auto;
`;

const ResultsHeadingContainer = styled('div')`
  display: flex;
`;

class Feed extends React.Component<FeedProps, FeedState> {
  public static defaultProps = {
    capiFeedSpecs: []
  };

  public state = {
    capiFeedIndex: 0,
    displaySearchFilters: false
  };

  public updateDisplaySearchFilters = (newValue: boolean) =>
    this.setState({
      displaySearchFilters: newValue
    });

  public handleFeedClick = (index: number) =>
    this.setState({
      capiFeedIndex: index
    });

  public renderFixedContent = () => {
    if (!this.state.displaySearchFilters) {
      return (
        <ResultsHeadingContainer>
          <StageSelectionContainer>
            <RadioGroup>
              {this.props.capiFeedSpecs.map(({ name }, i) => (
                <RadioButton
                  key={name}
                  checked={i === this.state.capiFeedIndex}
                  onChange={() => this.handleFeedClick(i)}
                  label={name}
                  inline
                />
              ))}
            </RadioGroup>
          </StageSelectionContainer>
        </ResultsHeadingContainer>
      );
    }
    return null;
  };

  get isLoading() {
    return (
      (this.state.capiFeedIndex === 0 && this.props.liveLoading) ||
      (this.state.capiFeedIndex === 1 && this.props.previewLoading)
    );
  }

  get error() {
    return (
      (this.state.capiFeedIndex === 0 && this.props.liveError) ||
      (this.state.capiFeedIndex === 1 && this.props.previewError) ||
      null
    );
  }

  public render() {
    const getId = (internalPageCode: string | number | undefined) =>
      `internal-code/page/${internalPageCode}`;

    const articles =
      [this.props.capiFeedLiveArticles, this.props.capiFeedPreviewArticles][
        this.state.capiFeedIndex
      ] || [];

    return (
      <FeedContainer>
        <SearchInput
          updateDisplaySearchFilters={this.updateDisplaySearchFilters}
          displaySearchFilters={this.state.displaySearchFilters}
          additionalFixedContent={this.renderFixedContent}
          isPreview={this.state.capiFeedIndex !== 0}
        >
          <ErrorDisplay error={this.error}>
            <LoaderDisplay loading={this.isLoading}>
              {articles.length ? (
                articles
                  .filter(result => result.webTitle)
                  .map(
                    ({
                      id,
                      webTitle,
                      webUrl,
                      webPublicationDate,
                      sectionName,
                      fields,
                      pillarId
                    }) => (
                      <FeedItem
                        id={id}
                        key={webUrl}
                        title={webTitle}
                        href={webUrl}
                        publicationDate={webPublicationDate}
                        sectionName={sectionName}
                        pillarId={pillarId}
                        internalPageCode={
                          fields && getId(fields.internalPageCode)
                        }
                        firstPublicationDate={fields.firstPublicationDate}
                        isLive={!fields.isLive || fields.isLive === 'true'}
                      />
                    )
                  )
              ) : (
                <NoResults>No results found</NoResults>
              )}
            </LoaderDisplay>
          </ErrorDisplay>
        </SearchInput>
      </FeedContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  capiFeedSpecs: capiFeedSpecsSelector(state) as any,
  capiFeedLiveArticles: liveSelectors.selectAll(state),
  capiFeedPreviewArticles: previewSelectors.selectAll(state),
  liveLoading: liveSelectors.selectIsLoading(state),
  previewLoading: previewSelectors.selectIsLoading(state),
  liveError: liveSelectors.selectCurrentError(state),
  previewError: previewSelectors.selectCurrentError(state)
});

export default connect(mapStateToProps)(Feed);
