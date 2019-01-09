import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';
import { capiFeedSpecsSelector } from '../selectors/configSelectors';
import { RadioButton, RadioGroup } from './inputs/RadioButtons';
import { State } from 'types/State';
import { CapiArticle } from 'types/Capi';
import {
  selectLiveFeed,
  selectPreviewFeed,
  selectLiveLoading,
  selectPreviewLoading
} from 'bundles/capiFeedBundle';

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
}

interface FeedState {
  capiFeedIndex: number;
  displaySearchFilters: boolean;
}

interface LoaderDisplayProps {
  children: React.ReactNode;
  loading: boolean;
}

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <Loader /> : <React.Fragment>{children}</React.Fragment>;

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
        </SearchInput>
      </FeedContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  capiFeedSpecs: capiFeedSpecsSelector(state) as any,
  capiFeedLiveArticles: selectLiveFeed(state),
  capiFeedPreviewArticles: selectPreviewFeed(state),
  liveLoading: selectLiveLoading(state),
  previewLoading: selectPreviewLoading(state)
});

export default connect(mapStateToProps)(Feed);
