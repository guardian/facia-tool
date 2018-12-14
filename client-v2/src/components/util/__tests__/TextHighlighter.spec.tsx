import React from 'react';
import { render, prettyDOM, cleanup } from 'react-testing-library';
import TextHighlighter from 'components/util/TextHighlighter';

describe('TextHighlighter', () => {
  afterEach(cleanup);
  it('should render text with the parts that match the search string highlighted', () => {
    const { getAllByText } = render(
      <TextHighlighter
        originalString="An example string"
        searchString="example"
      />
    );
    expect(getAllByText('example').length).toBe(1);
  });
  it('should find all instances of the search string', () => {
    const { getAllByText } = render(
      <TextHighlighter
        originalString="An example string with two examples"
        searchString="example"
      />
    );
    expect(getAllByText('example').length).toBe(2);
  });
});
