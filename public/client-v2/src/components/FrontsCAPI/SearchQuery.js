// @flow

import * as React from 'react';
import CAPISearchQuery from '../CAPI/SearchQuery';
import pandaFetch from '../../services/pandaFetch';

type FrontCAPISearchQueryProps = {
  params: Object,
  children: *
};

const FrontCAPISearchQuery = ({
  params,
  children
}: FrontCAPISearchQueryProps) => (
  <CAPISearchQuery
    baseURL="https://fronts.local.dev-gutools.co.uk/api/live/"
    fetch={pandaFetch}
    debounce={500}
    params={{
      ...params,
      'show-elements': 'image'
    }}
  >
    {children}
  </CAPISearchQuery>
);

export default FrontCAPISearchQuery;
