// @flow

import * as React from 'react';
import CAPISearchQuery from './CAPI/CAPISearchQuery';
import FeedItem from './FeedItem';

const Feed = () => (
  <CAPISearchQuery apiKey="teleporter-view">
    {({ pending, value }) =>
      pending ? (
        <div>Loading!</div>
      ) : (
        value &&
        value.response.results.map(
          ({ webTitle, webUrl }: { webTitle: string, webUrl: string }) => (
            <FeedItem key={webUrl} title={webTitle} href={webUrl} />
          )
        )
      )
    }
  </CAPISearchQuery>
);

export default Feed;
