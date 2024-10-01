import React from 'react';
import Dropdown from '../inputs/Dropdown';
import { render } from 'react-testing-library';

describe('Dropdown', () => {
	it('should render correctly', () => {
		const { getByText } = render(
			<Dropdown
				items={[
					{
						value: '1',
						label: 'one',
					},
				]}
				onChange={() => {}}
			/>,
		);

		expect(getByText('one')).toBeTruthy();
	});
});
