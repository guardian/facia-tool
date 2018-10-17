

import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import pandaFetch from 'services/pandaFetch';
import { getThumbnailFromElements } from 'util/CAPIUtils';
import * as CAPIParamsContext from './CAPI/CAPIParamsContext';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';
import { capiFeedSpecsSelector } from '../selectors/configSelectors';
import { RadioButton, RadioGroup } from './inputs/RadioButtons';

type ErrorDisplayProps = {
  error: ?(Error | string),
  children: React.Node
};

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? (
    <div>{typeof error === 'string' ? error : error.message}</div>
  ) : (
    children
  );

type LoaderDisplayProps = {
  children: React.Node,
  loading: boolean
};

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <Loader /> : children;

type FeedSpec = {
  name: string,
  baseUrl: string
};

type FeedProps = {
  capiFeedSpecs: FeedSpec[]
};

type FeedState = {
  capiFeedIndex: number,
  displaySearchFilters: boolean
};

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
  static defaultProps = {
    capiFeedSpecs: []
  };

  state = {
    capiFeedIndex: 0,
    displaySearchFilters: false
  };

  get capiFeedSpec() {
    return this.props.capiFeedSpecs[this.state.capiFeedIndex];
  }

  updateDisplaySearchFilters = (newValue: boolean) =>
    this.setState({
      displaySearchFilters: newValue
    });

  handleFeedClick = (index: number) =>
    this.setState({
      capiFeedIndex: index
    });

  renderFixedContent = () => {
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

  render() {
    const { capiFeedSpec } = this;
    const getId = (internalPageCode: string | number) =>
      `internal-code/page/${internalPageCode}`;

    return (
      <FeedContainer>
        {!!capiFeedSpec && (
          <CAPIParamsContext.Provider
            baseURL={capiFeedSpec.baseUrl}
            fetch={pandaFetch}
            debounce={500}
          >
            <SearchInput
              updateDisplaySearchFilters={this.updateDisplaySearchFilters}
              displaySearchFilters={this.state.displaySearchFilters}
              additionalFixedContent={this.renderFixedContent}
            >
              {({ pending, error, value }) => (
                <React.Fragment>
                  <ErrorDisplay error={error}>
                    <LoaderDisplay loading={!value && pending}>
                      <div>
                        {value &&
                          value.response.results
                            .filter(result => result.webTitle)
                            .map(
                              ({
                                webTitle,
                                webUrl,
                                webPublicationDate,
                                elements,
                                fields,
                                frontsMeta: { tone }
                              }) => (
                                <FeedItem
                                  key={webUrl}
                                  title={webTitle}
                                  href={webUrl}
                                  publicationDate={webPublicationDate}
                                  tone={tone}
                                  trailText={fields && fields.trailText}
                                  thumbnailUrl={
                                    elements &&
                                    getThumbnailFromElements(elements)
                                  }
                                  internalPageCode={
                                    fields && getId(fields.internalPageCode)
                                  }
                                />
                              )
                            )}
                        {value &&
                          value.response.results.length === 0 && (
                            <NoResults>No results found</NoResults>
                          )}
                      </div>
                    </LoaderDisplay>
                  </ErrorDisplay>
                </React.Fragment>
              )}
            </SearchInput>
          </CAPIParamsContext.Provider>
        )}
      </FeedContainer>
    );
  }
}

const mapStateToProps = state => ({
  // $FlowFixMe: no idea why this doesn't work
  capiFeedSpecs: (capiFeedSpecsSelector(state) as any)
});

export default connect(mapStateToProps)(Feed);
