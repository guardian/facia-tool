import React from 'react';
import { render, prettyDOM, cleanup } from 'react-testing-library';
import TextHighlighter from 'components/util/TextHighlighter';
import { ThemeProvider } from 'styled-components';
import theme from 'shared/constants/theme';

describe('TextHighlighter', () => {
  afterEach(cleanup);
  it('should render text with the parts that match the search string highlighted', () => {
    const { getAllByText } = render(
      <ThemeProvider theme={theme}>
        <TextHighlighter
          originalString="An example string"
          searchString="example"
        />
      </ThemeProvider>
    );
    expect(getAllByText('example').length).toBe(1);
  });
  it('should find all instances of the search string', () => {
    const { getAllByText, container } = render(
      <ThemeProvider theme={theme}>
        <TextHighlighter
          originalString="An example string with two examples"
          searchString="example"
        />
      </ThemeProvider>
    );
    expect(getAllByText('example').length).toBe(2);
  });
});
