// @flow

import * as React from 'react';
import CAPISearchQuery from './CAPISearchQuery';
import Loader from '../Loader';
import pandaFetch from '../../services/pandaFetch';

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
