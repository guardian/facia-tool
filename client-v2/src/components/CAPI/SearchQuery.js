// @flow

import * as React from 'react';
import * as CAPIParamsContext from './CAPIParamsContext';
/* eslint-disable import/no-duplicates */
import capiQuery from '../../services/capiQuery';
import { type Fetch } from '../../services/capiQuery';
/* eslint-enable import/no-duplicates */
import Async from '../util/Async';

type CAPISearchQueryProps = {
  baseURL?: string,
  fetch?: Fetch,
  children: *,
  params: Object
};

class SearchQuery extends React.Component<CAPISearchQueryProps> {
  static defaultProps = {
    params: {}
  };

  constructor(props: CAPISearchQueryProps) {
    super(props);
    this.setupCAPI(this.props.baseURL, this.props.fetch);
  }

  componentWillReceiveProps(nextProps: CAPISearchQueryProps) {
    if (
      (nextProps.baseURL && this.props.baseURL !== nextProps.baseURL) ||
      (nextProps.fetch && this.props.fetch !== nextProps.fetch)
    ) {
      this.setupCAPI(this.props.baseURL, this.props.fetch);
    }
  }

  setupCAPI(baseURL?: string, fetch?: Fetch): void {
    this.capi = capiQuery(baseURL, fetch).search;
  }

  capi: $ElementType<$Call<typeof capiQuery, string>, 'search'>;

  render() {
    const { params, children, ...props } = this.props;
    return (
      <Async {...props} fn={this.capi} args={[params]}>
        {children}
      </Async>
    );
  }
}

const SearchQueryWithContext = (props: CAPISearchQueryProps) => (
  <CAPIParamsContext.Consumer>
    {contextProps => (
      <SearchQuery
        {...{
          ...contextProps,
          ...props,
          params: {
            ...contextProps.params,
            ...props.params
          }
        }}
      />
    )}
  </CAPIParamsContext.Consumer>
);

export default SearchQueryWithContext;
