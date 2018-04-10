// @flow

import * as React from 'react';
import CAPITagQuery from '../CAPI/TagQuery';
import pandaFetch from '../../services/pandaFetch';

type FrontCAPITagQueryProps = {
  params: Object,
  children: *
};

const FrontCAPITagQuery = ({ params, children }: FrontCAPITagQueryProps) => (
  <CAPITagQuery
    baseURL="https://fronts.local.dev-gutools.co.uk/api/live/"
    fetch={pandaFetch}
    debounce={500}
    params={params}
  >
    {children}
  </CAPITagQuery>
);

export default FrontCAPITagQuery;
