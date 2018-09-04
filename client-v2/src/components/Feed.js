// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import ContainerHeading from 'shared/components/typography/ContainerHeading';
import pandaFetch from 'services/pandaFetch';
import { getThumbnail } from 'util/CAPIUtils';
import * as CAPIParamsContext from './CAPI/CAPIParamsContext';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';
import { capiFeedSpecsSelector } from '../selectors/configSelectors';

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
  capiFeedIndex: number
};

const FeedContainer = styled('div')`
  height: 100%;
`;

const ResultsHeadingContainer = styled('div')`
  display: flex;
`;

class Feed extends React.Component<FeedProps, FeedState> {
  static defaultProps = {
    capiFeedSpecs: []
  };

  state = {
    capiFeedIndex: 0
  };

  get capiFeedSpec() {
    return this.props.capiFeedSpecs[this.state.capiFeedIndex];
  }

  handleFeedClick(index: number) {
    this.setState({
      capiFeedIndex: index
    });
  }

  renderFixedContent = () => (
    <ResultsHeadingContainer>
      <ContainerHeading>Results</ContainerHeading>
    </ResultsHeadingContainer>
  );

  render() {
    const { capiFeedSpec } = this;
    const getId = (internalPageCode: string) =>
      `internal-code/page/${internalPageCode}`;

    return (
      <FeedContainer>
        {!!capiFeedSpec && (
          <CAPIParamsContext.Provider
            baseURL={capiFeedSpec.baseUrl}
            fetch={pandaFetch}
            debounce={500}
          >
            <SearchInput additionalFixedContent={this.renderFixedContent}>
              {({ pending, error, value }) => (
                <React.Fragment>
                  <ErrorDisplay error={error}>
                    <LoaderDisplay loading={!value && pending}>
                      <div>
                        {value &&
                          value.response.results.map(
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
                                  elements && getThumbnail(elements)
                                }
                                internalPageCode={
                                  fields && getId(fields.internalPageCode)
                                }
                              />
                            )
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
  capiFeedSpecs: (capiFeedSpecsSelector(state): any)
});

export default connect(mapStateToProps)(Feed);
