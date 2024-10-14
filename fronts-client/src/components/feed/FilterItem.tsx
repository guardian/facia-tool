import React from 'react';
import { styled, theme } from 'constants/theme';
import { ClearIcon } from 'components/icons/Icons';
import { SmallRoundButton } from 'util/sharedStyles/buttons';

const SearchTermItem = styled.div`
	display: flex;
	justify-content: space-between;
	color: ${theme.capiInterface.text};
	font-weight: bold;
	border: ${`1px solid ${theme.capiInterface.borderLight}`};
	font-size: 14px;
	line-height: 32px;
	background-color: ${theme.capiInterface.backgroundWhite};
	padding: 5px 10px 5px 10px;
	margin-bottom: 10px;
	margin-right: 10px;
`;

interface FilterItemProps {
	children: React.ReactNode;
	onClear: () => void;
}

const FilterItem = ({ children, onClear }: FilterItemProps) => (
	<SearchTermItem>
		{children}
		<SmallRoundButton onClick={() => onClear()} title="Clear search">
			<ClearIcon fill={theme.base.colors.text} size={'l'} />
		</SmallRoundButton>
	</SearchTermItem>
);

export default FilterItem;
