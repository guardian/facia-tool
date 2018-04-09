// @flow

import * as React from 'react';
/* eslint-disable import/no-duplicates */
import capiQuery from '../../services/capiQuery';
import { type Fetch } from '../../services/capiQuery';
/* eslint-enable import/no-duplicates */
import Async, { type AsyncChild } from '../util/Async';

type Tag = {
  id: string,
  webTitle: string,
  webUrl: string
};

type CAPITagQueryReponse = {
  response: {
    results: Tag[]
  }
};

type CAPITagQueryChild = AsyncChild<CAPITagQueryReponse>;

type CAPISearchQueryProps = {
  baseURL?: string,
  fetch?: Fetch,
  children: CAPITagQueryChild,
  params: Object
};

class CAPIQuery extends React.Component<CAPISearchQueryProps> {
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
    this.capi = capiQuery(baseURL, fetch).tags;
  }

  capi: $ElementType<$Call<typeof capiQuery, string>, 'tags'>;

  render() {
    const { params, children, ...props } = this.props;
    return (
      <Async {...props} fn={this.capi} args={[params]}>
        {children}
      </Async>
    );
  }
}

export type { CAPITagQueryChild, CAPITagQueryReponse };
export default CAPIQuery;
