import React from 'react';
import { render, cleanup } from 'react-testing-library';
import CollectionItemTrail from '../CollectionItemTrail';

afterEach(cleanup);

describe('CollectionItemTrail', () => {
  it('does not render html by default', () => {
    const { getByTestId } = render(
      <CollectionItemTrail children="<strong data-testid='test'>Test</strong>" />
    );
    expect(() => getByTestId('test')).toThrow();
  });

  it('renders sanitized html when asked', () => {
    const { getByTestId } = render(
      <CollectionItemTrail
        html
        children="<span data-testid='test'><strong>Test</strong><iframe></iframe></span>"
      />
    );
    expect(getByTestId('test').innerHTML).toBe('<strong>Test</strong>');
  });
});
