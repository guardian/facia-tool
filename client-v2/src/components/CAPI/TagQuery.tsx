import React from 'react';
import capiQuery, { Fetch } from 'services/capiQuery';
import { $ElementType, $Call } from 'utility-types';
import Async from 'components/util/Async';
import * as CAPIParamsContext from './CAPIParamsContext';

type CAPITagQueryProps = {
  baseURL?: string;
  fetch?: Fetch;
  children: any;
  params: Object;
  tagType: 'sections' | 'tags';
};

type CAPITagQueryState = {
  capi: $ElementType<
    $Call<typeof capiQuery>,
    number | 'sections' | 'tags' | 'search'
  > | void;
  baseURL: string | void;
  fetch: Fetch | void;
};

class TagQuery extends React.Component<CAPITagQueryProps, CAPITagQueryState> {
  static defaultProps = {
    params: {}
  };

  state = {
    capi: undefined,
    baseURL: undefined,
    fetch: undefined
  };

  static getDerivedStateFromProps(
    { baseURL, fetch, tagType }: CAPITagQueryProps,
    prevState: CAPITagQueryState
  ) {
    if (
      (baseURL && prevState.baseURL !== baseURL) ||
      (fetch && prevState.fetch !== fetch)
    ) {
      return {
        capi: capiQuery(baseURL, fetch)[tagType],
        baseURL,
        fetch
      };
    }
    return {};
  }

  render() {
    const { params, children, ...props } = this.props;
    return (
      <Async {...props} fn={this.state.capi} args={[params]}>
        {children}
      </Async>
    );
  }
}

const TagQueryWithContext = (props: CAPITagQueryProps) => (
  <CAPIParamsContext.Consumer>
    {contextProps => (
      <TagQuery
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

export default TagQueryWithContext;
