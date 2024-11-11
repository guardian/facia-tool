import React from 'react';
import { styled } from 'constants/theme';

interface DropdownProps {
	current?: string | void;
	items: Array<{
		value: string;
		label: string;
	}> | void;
	onChange: (value: string) => void;
	deselectValue?: string;
	deselectText?: string;
}

const Select = styled.select`
	padding: 10px;
	margin-left: 5px;
	margin-top: 10px;
	border: 1px solid;
	height: 30px;
	font-size: 16px;
`;

const Dropdown = ({
	current,
	items,
	onChange,
	deselectValue,
	deselectText = 'Select one',
}: DropdownProps) => (
	<Select
		value={current || ''}
		onChange={({
			currentTarget: { value },
		}: React.ChangeEvent<HTMLSelectElement>) => onChange(value)}
	>
		{!!deselectValue && (
			<option key={deselectValue} value={deselectValue}>
				{deselectText}
			</option>
		)}
		{(items || []).map(({ value, label }) => (
			<option key={value} value={value}>
				{label}
			</option>
		))}
	</Select>
);

export { DropdownProps };
export default Dropdown;
