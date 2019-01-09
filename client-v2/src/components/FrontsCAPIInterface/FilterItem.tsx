import React from 'react';
import styled from 'styled-components';
import moreImage from 'shared/images/icons/more.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';

const SearchTermItem = styled('div')`
  color: #121212;
  font-weight: bold;
  border: solid 1px #c4c4c4;
  font-size: 14px;
  background-color: #ffffff;
  padding: 7px 15px 7px 15px;
  margin-bottom: 10px;
  :hover {
    color: #c4c4c4;
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
      <ClearButtonIcon src={moreImage} alt="" height="22px" width="22px" />
    </SmallRoundButton>
  </SearchTermItem>
);

export default FilterItem;
