// @flow

import * as React from 'react';
/* eslint-disable import/no-duplicates */
import CAPISearchQuery from './CAPI/CAPISearchQuery';
import { type Element } from './CAPI/CAPISearchQuery';
/* eslint-enable import/no-duplicates */
import ScrollContainer from './ScrollContainer';
import FeedItem from './FeedItem';

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

const Feed = () => (
  <ScrollContainer title="Feed">
    <CAPISearchQuery
      apiKey="teleporter-view"
      params={{ 'show-elements': 'image' }}
    >
      {({ pending, value }) =>
        pending ? (
          <div>Loading!</div>
        ) : (
          value &&
          value.response.results.map(({ webTitle, webUrl, elements }) => (
            <FeedItem
              key={webUrl}
              title={webTitle}
              href={webUrl}
              thumbnailUrl={elements && getThumbnail(elements)}
            />
          ))
        )
      }
    </CAPISearchQuery>
  </ScrollContainer>
);

export default Feed;
