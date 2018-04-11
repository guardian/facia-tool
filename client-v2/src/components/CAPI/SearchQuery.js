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
  params: Object,
  poll?: number
};

class SearchQuery extends React.Component<CAPISearchQueryProps> {
  static defaultProps = {
    params: {}
  };

  constructor(props: CAPISearchQueryProps) {
    super(props);
    this.setupCAPI(this.props.baseURL, this.props.fetch);
  }

  componentDidMount() {
    if (this.props.poll) {
      this.startPolling(this.props.poll);
    }
  }

  componentWillReceiveProps(nextProps: CAPISearchQueryProps) {
    if (
      (nextProps.baseURL && this.props.baseURL !== nextProps.baseURL) ||
      (nextProps.fetch && this.props.fetch !== nextProps.fetch)
    ) {
      this.setupCAPI(this.props.baseURL, this.props.fetch);
    }
  }

  componentDidUpdate(prevProps: CAPISearchQueryProps) {
    if (!prevProps.poll && this.props.poll) {
      this.startPolling(this.props.poll);
    } else if (prevProps.poll && !this.props.poll) {
      this.stopPolling();
    }
  }

  setupCAPI(baseURL?: string, fetch?: Fetch): void {
    this.capi = capiQuery(baseURL, fetch).search;
  }

  poll = () => {
    if (this.async) {
      this.async.startRun();
    }
  };

  startPolling = (rate: number) => {
    if (this.props.poll) {
      this.interval = setInterval(this.poll, rate);
    }
  };

  stopPolling = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
  };

  interval: ?IntervalID;
  capi: $ElementType<$Call<typeof capiQuery, string>, 'search'>;
  async: ?Async<*, *>;

  render() {
    const { params, children, ...props } = this.props;
    return (
      <Async
        ref={node => {
          this.async = node;
        }}
        {...props}
        fn={this.capi}
        args={[params]}
      >
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
