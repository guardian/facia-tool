// @flow

import * as React from 'react';
/* eslint-disable import/no-duplicates */
import { type Element } from '../services/capiQuery';
/* eslint-enable import/no-duplicates */
import ScrollContainer from './ScrollContainer';
import FeedItem from './FeedItem';
import SearchInput from './FrontsCAPIInterface/SearchInput';
import Loader from './Loader';

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

const Feed = () => (
  <ScrollContainer title="Feed">
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
  </ScrollContainer>
);

export default Feed;
