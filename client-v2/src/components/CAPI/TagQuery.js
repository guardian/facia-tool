// @flow

import * as React from 'react';
/* eslint-disable import/no-duplicates */
import capiQuery from 'services/capiQuery';
import { type Fetch } from 'services/capiQuery';
/* eslint-enable import/no-duplicates */
import Async from 'components/util/Async';
import * as CAPIParamsContext from './CAPIParamsContext';

type CAPITagQueryProps = {
  baseURL?: string,
  fetch?: Fetch,
  children: *,
  params: Object,
  tagType: 'sections' | 'tags'
};

type CAPITagQueryState = {
  capi?: $ElementType<$Call<typeof capiQuery, 'sections' | 'tags'>, string>,
  baseURL?: string,
  fetch?: Fetch
};

class TagQuery extends React.Component<CAPITagQueryProps, CAPITagQueryState> {
  static defaultProps = {
    params: {}
  };

  state = {};

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
