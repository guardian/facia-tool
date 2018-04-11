// @flow

import * as React from 'react';

// $FlowFixMe: currently no typings for createContext
const { Provider: InnerProvider, Consumer } = React.createContext({
  params: {}
});

const Provider = ({ children, ...props }: *) => (
  <InnerProvider value={props}>{children}</InnerProvider>
);

export { Provider, Consumer };
