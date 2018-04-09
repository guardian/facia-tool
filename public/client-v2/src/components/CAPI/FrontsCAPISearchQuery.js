// @flow

import * as React from 'react';
import CAPISearchQuery from './CAPISearchQuery';
import Loader from '../Loader';
import pandaFetch from '../../services/pandaFetch';

type ErrorDisplayProps = {
  error: ?Error,
  children: React.Node
};

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? <div>{error.message}</div> : children;

type LoaderDisplayProps = {
  children: React.Node,
  loading: boolean
};

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <Loader /> : children;

type FrontCAPISearchQueryProps = {
  params: Object,
  children: (value: *) => React.Node
};

const FrontCAPISearchQuery = ({
  params,
  children
}: FrontCAPISearchQueryProps) => (
  <CAPISearchQuery
    baseURL="https://fronts.local.dev-gutools.co.uk/api/live/"
    fetch={pandaFetch}
    params={params}
  >
    {({ pending, error, value }) => (
      <ErrorDisplay error={error}>
        <LoaderDisplay loading={pending}>
          {value && children(value)}
        </LoaderDisplay>
      </ErrorDisplay>
    )}
  </CAPISearchQuery>
);

export default FrontCAPISearchQuery;
