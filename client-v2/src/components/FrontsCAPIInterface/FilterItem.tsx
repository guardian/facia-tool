import React from 'react';
import { styled } from 'constants/theme';
import { ClearIcon } from 'shared/components/icons/Icons';
import { SmallRoundButton } from 'util/sharedStyles/buttons';

const SearchTermItem = styled('div')`
  color: ${({ theme }) => theme.capiInterface.text};
  font-weight: bold;
  border: ${({ theme }) => `1px solid ${theme.capiInterface.borderLight}`};
  font-size: 14px;
  background-color: ${({ theme }) => theme.capiInterface.backgroundWhite};
  padding: 7px 15px 7px 15px;
  margin-bottom: 10px;
  :hover {
    color: ${({ theme }) => theme.capiInterface.textLight};
  }
`;

interface FilterItemProps {
  children: React.ReactNode;
  onClear: () => void;
}

const FilterItem = ({ children, onClear }: FilterItemProps) => (
  <SearchTermItem>
    {children}
    <SmallRoundButton onClick={() => onClear()} title="Clear search">
      <ClearIcon size={'l'} />
    </SmallRoundButton>
  </SearchTermItem>
);

export default FilterItem;
