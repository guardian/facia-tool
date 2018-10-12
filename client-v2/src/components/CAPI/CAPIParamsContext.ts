

import * as React from 'react';

const { Provider: InnerProvider, Consumer } = React.createContext({
  params: {}
});

const Provider = ({ children, ...props }: *) => (
  <InnerProvider value={props}>{children}</InnerProvider>
);

export { Provider, Consumer };
