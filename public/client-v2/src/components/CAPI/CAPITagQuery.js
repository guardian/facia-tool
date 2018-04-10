// @flow

import * as React from 'react';
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

class CAPIQuery extends React.Component<CAPITagQueryProps> {
  static defaultProps = {
    params: {}
  };

  constructor(props: CAPITagQueryProps) {
    super(props);
    this.setupCAPI(this.props.baseURL, this.props.fetch);
  }

  componentWillReceiveProps(nextProps: CAPITagQueryProps) {
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

export default CAPIQuery;
