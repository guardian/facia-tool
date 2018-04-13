// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as CAPIParamsContext from './CAPI/CAPIParamsContext';
import { type Element } from '../services/capiQuery';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Button from './Button';
import Loader from './Loader';
import pandaFetch from '../services/pandaFetch';
import { capiFeedSpecsSelector } from '../selectors/feedsSelectors';
import Row from './Row';
import Col from './Col';

// TODO: get apiKey from context (or speak directly to FrontsAPI)

const getThumbnail = (_elements: Element[]) => {
  const elements = _elements.filter(
    element => element.type === 'image' && element.relation === 'thumbnail'
  );

  if (!elements.length) {
    return null;
  }

  const { assets } = elements[0];

  let smallestAsset = null;

  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    if (
      !smallestAsset ||
      +asset.typeData.width < +smallestAsset.typeData.width
    ) {
      smallestAsset = asset;
    }
  }

  return smallestAsset && smallestAsset.file;
};

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
  display: flex;
  flex: 1;
  flex-direction: column;
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

  render() {
    const { capiFeedSpec } = this;

    return (
      <FeedContainer>
        <Row>
          {this.props.capiFeedSpecs.map(({ name }, i) => (
            <Col key={name}>
              <Button
                selected={i === this.state.capiFeedIndex}
                onClick={() => this.handleFeedClick(i)}
              >
                {name}
              </Button>
            </Col>
          ))}
        </Row>

        {!!capiFeedSpec && (
          <CAPIParamsContext.Provider
            baseURL={capiFeedSpec.baseUrl}
            fetch={pandaFetch}
            debounce={500}
          >
            <SearchInput>
              {({ pending, error, value }) => (
                <ErrorDisplay error={error}>
                  <LoaderDisplay loading={!value && pending}>
                    {value &&
                      value.response.results.map(
                        ({ webTitle, webUrl, elements }) => (
                          <FeedItem
                            key={webUrl}
                            title={webTitle}
                            href={webUrl}
                            thumbnailUrl={elements && getThumbnail(elements)}
                          />
                        )
                      )}
                  </LoaderDisplay>
                </ErrorDisplay>
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
