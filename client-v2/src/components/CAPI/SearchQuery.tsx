import React from 'react';
import capiQuery, { CAPISearchQueryReponse, Fetch } from 'services/capiQuery';
import Async, { AsyncState, AsyncChild } from 'components/util/Async';
import * as CAPIParamsContext from './CAPIParamsContext';

type CAPISearch = ReturnType<typeof capiQuery>['search'];
type SearchReturn = ReturnType<CAPISearch>;
type ChildrenParams = AsyncState<SearchReturn>;

interface CAPISearchQueryProps {
  baseURL?: string;
  fetch?: Fetch;
  children: AsyncChild<SearchReturn>;
  params: object;
  options?: { isResource: boolean };
  poll?: number;
  isPreview: boolean;
}

interface CAPISearchQueryState {
  capi?: CAPISearch;
  baseURL?: string;
  fetch?: Fetch;
}

class SearchQuery extends React.Component<
  CAPISearchQueryProps,
  CAPISearchQueryState
> {
  public static defaultProps = {
    params: {}
  };

  public static getDerivedStateFromProps(
    { baseURL, fetch, isPreview }: CAPISearchQueryProps,
    prevState: CAPISearchQueryState
  ) {
    if (
      (baseURL && prevState.baseURL !== baseURL) ||
      (fetch && prevState.fetch !== fetch)
    ) {
      return {
        capi: isPreview
          ? capiQuery(baseURL, fetch).scheduled
          : capiQuery(baseURL, fetch).search,
        baseURL,
        fetch
      };
    }
    return {};
  }
  public state: CAPISearchQueryState = {};
  public interval: number | void = undefined;
  public async: Async<any[], SearchReturn> | null = null;

  public componentDidMount() {
    if (this.props.poll) {
      this.startPolling(this.props.poll);
    }
  }

  public componentDidUpdate(prevProps: CAPISearchQueryProps) {
    if (!prevProps.poll && this.props.poll) {
      this.startPolling(this.props.poll);
    } else if (prevProps.poll && !this.props.poll) {
      this.stopPolling();
    }
  }

  public poll = () => {
    if (this.async) {
      this.async.startRun();
    }
  };

  public startPolling = (rate: number) => {
    if (this.props.poll) {
      this.interval = window.setInterval(this.poll, rate);
    }
  };

  public stopPolling = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
  };

  public render() {
    const { params, children, fetch, baseURL, options, ...props } = this.props;
    return (
      <Async<any[], SearchReturn>
        ref={(node: Async<any[], SearchReturn> | null) => {
          this.async = node;
        }}
        {...props}
        fn={this.state.capi}
        args={[params, options]}
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

export {
  SearchQuery as SearchQueryWithoutContext,
  ChildrenParams,
  CAPISearchQueryReponse
};

export default SearchQueryWithContext;
