// @flow

import * as React from 'react';
import CAPIParameterBuilder from './CAPIParameterBuilder';
import FrontsCapiSearchQuery from './FrontsCAPISearchQuery';

type FrontsCAPISearchInputProps = {
  children: (value: *) => React.Node
};

const FrontsCAPISearchInput = ({ children }: FrontsCAPISearchInputProps) => (
  <CAPIParameterBuilder params={{ q: 'trump' }}>
    {params => (
      <FrontsCapiSearchQuery params={params}>{children}</FrontsCapiSearchQuery>
    )}
  </CAPIParameterBuilder>
);

export default FrontsCAPISearchInput;
