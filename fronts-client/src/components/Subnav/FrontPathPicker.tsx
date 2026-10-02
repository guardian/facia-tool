import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { css } from '@emotion/react';
import { Autocomplete } from '@guardian/stand/TagPicker';
import { selectFronts } from 'selectors/shared';

interface FrontPathOption {
	// The front path, which is also the value stored on the nav item.
	id: string;
	// The label shown in the dropdown (display name alongside the path).
	name: string;
}

interface FrontPathPickerProps {
	value: string;
	onChange: (path: string) => void;
	label: string;
	placeholder?: string;
}

// Keep the dropdown to a sensible length when nothing has been typed yet.
const MAX_OPTIONS = 100;

const inputStyles = css`
	align-self: flex-end;

	input {
		height: 2.5rem;
		padding-top: 0;
		padding-bottom: 0;
		font-size: 16px;
	}
`;

const FrontPathPicker = ({
	value,
	onChange,
	label,
	placeholder,
}: FrontPathPickerProps) => {
	const fronts = useSelector(selectFronts);

	const allOptions = useMemo<FrontPathOption[]>(
		() =>
			Object.keys(fronts)
				.map((path) => {
					const displayName = fronts[path]?.displayName;
					return {
						id: path,
						name: displayName ? `${displayName} — ${path}` : path,
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		[fronts],
	);

	const options = useMemo(() => {
		const query = value.trim().toLowerCase();
		const matches = query
			? allOptions.filter((option) => option.name.toLowerCase().includes(query))
			: allOptions;
		return matches.slice(0, MAX_OPTIONS);
	}, [allOptions, value]);

	// Stand's Autocomplete clears the input after a selection (it is built for
	// multi-tag picking). We record the picked path here so the following
	// "cleared" change can commit the path instead of an empty value.
	const pendingSelection = useRef<string | null>(null);

	const handleTextInputChange = (text: string) => {
		if (pendingSelection.current !== null) {
			const path = pendingSelection.current;
			pendingSelection.current = null;
			onChange(path);
			return;
		}
		// Guard against the full option label being handed back instead of the
		// path, so we always store the front's path.
		const matched = allOptions.find((option) => option.name === text);
		onChange(matched ? matched.id : text);
	};

	return (
		<Autocomplete
			label={label}
			placeholder={placeholder ?? 'Search fronts'}
			value={value}
			options={options}
			loading={false}
			disabled={false}
			onTextInputChange={handleTextInputChange}
			addSelection={(option) => {
				pendingSelection.current = option.id;
			}}
			cssOverrides={inputStyles}
		/>
	);
};

export default FrontPathPicker;
