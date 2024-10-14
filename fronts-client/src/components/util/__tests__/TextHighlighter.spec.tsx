import React from 'react';
import { render, cleanup } from 'react-testing-library';
import TextHighlighter from 'components/util/TextHighlighter';

describe('TextHighlighter', () => {
	afterEach(cleanup);
	it('should render text with the parts that match the search string highlighted', () => {
		const { getAllByText } = render(
			<TextHighlighter
				originalString="An example string"
				searchString="example"
			/>,
		);
		expect(getAllByText('example').length).toBe(1);
	});
	it('should find all instances of the search string', () => {
		const { getAllByText } = render(
			<TextHighlighter
				originalString="An example string with two examples"
				searchString="example"
			/>,
		);
		expect(getAllByText('example').length).toBe(2);
	});
	it('should only search for two characters or more', () => {
		let element = render(
			<TextHighlighter
				originalString="An example string with two examples"
				searchString="e"
			/>,
		);
		expect(
			element.getAllByText('An example string with two examples').length,
		).toBe(1);
		element = render(
			<TextHighlighter
				originalString="An example string with two examples"
				searchString="ex"
			/>,
		);
		expect(element.getAllByText('ex').length).toBe(2);
	});
});
