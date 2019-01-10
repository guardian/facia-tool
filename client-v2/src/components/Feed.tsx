import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import pandaFetch from 'services/pandaFetch';
import * as CAPIParamsContext from './CAPI/CAPIParamsContext';
import FeedItem from './FeedItem';
import SearchInput, {
  AsyncState,
  CAPISearchQueryReponse
} from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';
import { capiFeedSpecsSelector } from '../selectors/configSelectors';
import { RadioButton, RadioGroup } from './inputs/RadioButtons';
import { State } from 'types/State';
import { CapiArticle } from 'types/Capi';

interface ErrorDisplayProps {
  error: Error | string | void;
  children: React.ReactNode;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? (
    <div>{typeof error === 'string' ? error : error.message}</div>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );

interface LoaderDisplayProps {
  children: React.ReactNode;
  loading: boolean;
}

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <Loader /> : <React.Fragment>{children}</React.Fragment>;

interface FeedSpec {
  name: string;
  baseUrl: string;
}

interface FeedProps {
  capiFeedSpecs: FeedSpec[];
}

interface FeedState {
  capiFeedIndex: number;
  displaySearchFilters: boolean;
}

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

  get capiFeedSpec() {
    return this.props.capiFeedSpecs[this.state.capiFeedIndex];
  }

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

  public render() {
    const { capiFeedSpec } = this;
    const getId = (internalPageCode: string | number | undefined) =>
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
              isPreview={this.state.capiFeedIndex !== 0}
            >
              {({
                pending,
                error,
                value
              }: AsyncState<CAPISearchQueryReponse>) => {
                let results: CapiArticle[];
                if (!value) {
                  results = [];
                } else {
                  results =
                    value.response.results ||
                    (value.response.content && [value.response.content]) ||
                    [];
                }

                return (
                  <React.Fragment>
                    <ErrorDisplay error={error}>
                      <LoaderDisplay loading={!value && pending}>
                        <div>
                          {results
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
                                  firstPublicationDate={
                                    fields.firstPublicationDate
                                  }
                                  isLive={
                                    !fields.isLive || fields.isLive === 'true'
                                  }
                                />
                              )
                            )}
                          {value &&
                            value.response.results &&
                            value.response.results.length === 0 && (
                              <NoResults>No results found</NoResults>
                            )}
                        </div>
                      </LoaderDisplay>
                    </ErrorDisplay>
                  </React.Fragment>
                );
              }}
            </SearchInput>
          </CAPIParamsContext.Provider>
        )}
      </FeedContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  capiFeedSpecs: capiFeedSpecsSelector(state) as any
});

export default connect(mapStateToProps)(Feed);
