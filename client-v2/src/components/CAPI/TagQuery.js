// @flow

import * as React from 'react';
import * as CAPIParamsContext from './CAPIParamsContext';
/* eslint-disable import/no-duplicates */
import capiQuery from '../../services/capiQuery';
import { type Fetch } from '../../services/capiQuery';
/* eslint-enable import/no-duplicates */
import Async from '../util/Async';

type CAPITagQueryProps = {
  baseURL?: string,
  fetch?: Fetch,
  children: *,
  params: Object
};

type CAPITagQueryState = {
  capi?: $ElementType<$Call<typeof capiQuery, string>, 'tags'>,
  baseURL?: string,
  fetch?: Fetch
};

class TagQuery extends React.Component<CAPITagQueryProps, CAPITagQueryState> {
  static defaultProps = {
    params: {}
  };

  static getDerivedStateFromProps(
    { baseURL, fetch }: CAPITagQueryProps,
    prevState: CAPITagQueryState
  ) {
    if (
      (baseURL && prevState.baseURL !== baseURL) ||
      (fetch && prevState.fetch !== fetch)
    ) {
      return {
        capi: capiQuery(baseURL, fetch).tags,
        baseURL,
        fetch
      };
    }
    return {};
  }

  state = {};

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
