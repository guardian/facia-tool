import React from 'react';
import { render, cleanup } from 'react-testing-library';
import CardHeading from '../CardHeading';

afterEach(cleanup);

describe('CardHeading', () => {
	it('does not render html by default', () => {
		const { getByTestId } = render(
			<CardHeading children="<strong data-testid='test'>Test</strong>" />,
		);
		expect(() => getByTestId('test')).toThrow();
	});

	it('renders sanitized html when asked', () => {
		const { getByTestId } = render(
			<CardHeading
				html
				children="<span data-testid='test'><strong>Test</strong><iframe></iframe></span>"
			/>,
		);
		expect(getByTestId('test').innerHTML).toBe('<strong>Test</strong>');
	});
});
