import * as React from 'react';
/* eslint-disable import/no-duplicates */
import capiQuery from 'services/capiQuery';
import { Fetch } from 'services/capiQuery';
import { $ElementType, $Call } from 'utility-types';
/* eslint-enable import/no-duplicates */
import Async from 'components/util/Async';
import * as CAPIParamsContext from './CAPIParamsContext';

type CAPISearchQueryProps = {
  baseURL?: string;
  fetch?: Fetch;
  children: any;
  params: Object;
  poll?: number;
};

type CAPISearchQueryState = {
  capi?: $ElementType<$Call<typeof capiQuery>, 'search'>;
  baseURL?: string;
  fetch?: Fetch;
};

class SearchQuery extends React.Component<
  CAPISearchQueryProps,
  CAPISearchQueryState
> {
  static defaultProps = {
    params: {}
  };
  state: CAPISearchQueryState = {};
  interval: NodeJS.Timer | void = undefined;
  async: Async<any, any> | void = undefined;

  static getDerivedStateFromProps(
    { baseURL, fetch }: CAPISearchQueryProps,
    prevState: CAPISearchQueryState
  ) {
    if (
      (baseURL && prevState.baseURL !== baseURL) ||
      (fetch && prevState.fetch !== fetch)
    ) {
      return {
        capi: capiQuery(baseURL, fetch).search,
        baseURL,
        fetch
      };
    }
    return {};
  }

  componentDidMount() {
    if (this.props.poll) {
      this.startPolling(this.props.poll);
    }
  }

  componentDidUpdate(prevProps: CAPISearchQueryProps) {
    if (!prevProps.poll && this.props.poll) {
      this.startPolling(this.props.poll);
    } else if (prevProps.poll && !this.props.poll) {
      this.stopPolling();
    }
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

  render() {
    const { params, children, fetch, baseURL, ...props } = this.props;
    return (
      <Async
        ref={(node: Async<any, any>) => {
          this.async = node;
        }}
        {...props}
        fn={this.state.capi}
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

export { SearchQuery as SearchQueryWithoutContext };

export default SearchQueryWithContext;
