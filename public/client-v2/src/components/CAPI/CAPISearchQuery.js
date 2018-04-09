// @flow

import * as React from 'react';
import capiQuery from '../../services/capiQuery';
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

type CAPIQueryProps = {
  apiKey: string,
  children: CAPIQueryChild,
  params: Object
};

class CAPIQuery extends React.Component<CAPIQueryProps> {
  static defaultProps = {
    params: {}
  };

  constructor(props: CAPIQueryProps) {
    super(props);
    this.setupCAPI(this.props.apiKey);
  }

  componentWillReceiveProps(nextProps: CAPIQueryProps) {
    if (nextProps.apiKey && this.props.apiKey !== nextProps.apiKey) {
      this.setupCAPI(nextProps.apiKey);
    }
  }

  setupCAPI(apiKey: string): void {
    this.capi = capiQuery(apiKey).search;
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
