import React from 'react';

const { Provider: InnerProvider, Consumer } = React.createContext({
  params: {}
});

interface ProviderProps {
  children: React.ReactNode;
  params?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const Provider = ({ children, params = {}, ...props }: ProviderProps) => (
  <InnerProvider
    value={{
      params,
      ...props
    }}
  >
    {children}
  </InnerProvider>
);

export { Provider, Consumer };
