// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import * as CAPIParamsContext from './CAPI/CAPIParamsContext';
import { type Element } from '../services/capiQuery';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';
import pandaFetch from '../services/pandaFetch';
import { capiLiveURLSelector } from '../selectors/feedsSelectors';

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

type FeedProps = {
  capiLiveUrl: string
};

const Feed = ({ capiLiveUrl }: FeedProps) =>
  !!capiLiveUrl && (
    <CAPIParamsContext.Provider
      baseURL={capiLiveUrl}
      fetch={pandaFetch}
      debounce={500}
    >
      <SearchInput>
        {({ pending, error, value }) => (
          <ErrorDisplay error={error}>
            <LoaderDisplay loading={pending}>
              {value &&
                value.response.results.map(({ webTitle, webUrl, elements }) => (
                  <FeedItem
                    key={webUrl}
                    title={webTitle}
                    href={webUrl}
                    thumbnailUrl={elements && getThumbnail(elements)}
                  />
                ))}
            </LoaderDisplay>
          </ErrorDisplay>
        )}
      </SearchInput>
    </CAPIParamsContext.Provider>
  );

const mapStateToProps = state => ({
  capiLiveUrl: capiLiveURLSelector(state)
});

export default connect(mapStateToProps)(Feed);
