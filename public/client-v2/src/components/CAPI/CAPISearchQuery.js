// @flow

import * as React from 'react';
/* eslint-disable import/no-duplicates */
import capiQuery from '../../services/capiQuery';
import { type Fetch } from '../../services/capiQuery';
/* eslint-enable import/no-duplicates */
import Async, { type AsyncChild } from '../util/Async';

type ImageAsset = {
  type: 'image',
  mimeType: string,
  file: string,
  typeData: {
    width: string,
    number: string
  }
};

type ImageElement = {
  id: string,
  relation: string,
  type: 'image',
  assets: ImageAsset[]
};

type Element = ImageElement;

type Article = {
  webTitle: string,
  webUrl: string,
  elements?: Element[]
};

type CAPIQueryReponse = {
  response: {
    results: Article[]
  }
};

type CAPIQueryChild = AsyncChild<CAPIQueryReponse>;

type CAPISearchQueryProps = {
  baseURL?: string,
  fetch?: Fetch,
  children: CAPIQueryChild,
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

export type { CAPIQueryChild, ImageAsset, Element, Article, CAPIQueryReponse };
export default CAPIQuery;
