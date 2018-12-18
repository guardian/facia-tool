import React from 'react';
import capiQuery, { Fetch, CAPITagQueryReponse } from 'services/capiQuery';
import { $ElementType, $Call } from 'utility-types';
import Async, { AsyncState } from 'components/util/Async';
import * as CAPIParamsContext from './CAPIParamsContext';

interface CAPITagQueryProps {
  baseURL?: string;
  fetch?: Fetch;
  children: any;
  params: object;
  tagType: 'sections' | 'tags' | 'desks';
}

interface CAPITagQueryState {
  capi: $ElementType<
    $Call<typeof capiQuery>,
    number | 'sections' | 'tags' | 'desks' | 'search'
  > | void;
  baseURL: string | void;
  fetch: Fetch | void;
}

class TagQuery extends React.Component<CAPITagQueryProps, CAPITagQueryState> {
  public static defaultProps = {
    params: {}
  };

  public static getDerivedStateFromProps(
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

  public state = {
    capi: undefined,
    baseURL: undefined,
    fetch: undefined
  };

  public render() {
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

export { AsyncState, CAPITagQueryReponse };

export default TagQueryWithContext;
