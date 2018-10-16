import React from 'react';

const { Provider: InnerProvider, Consumer } = React.createContext({
  params: {}
});

const Provider = ({ children, ...props }: any) => (
  <InnerProvider value={props}>{children}</InnerProvider>
);

export { Provider, Consumer };
