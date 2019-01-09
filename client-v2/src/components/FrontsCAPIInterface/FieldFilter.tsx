import React from 'react';
import Downshift from 'downshift';
import startCase from 'lodash/startCase';
import styled from 'styled-components';
import ButtonCircularCaret from '../../shared/components/input/ButtonCircularCaret';
import FadeIn from 'shared/components/animation/FadeIn';

interface CAPIFieldFilterProps<T> {
  onChange: (value: T) => void;
  items: T[];
  placeholder?: string;
  filterTitle: string;
}

const FilterFieldDropdownMenu = FadeIn.extend`
  margin-right: 19px;
  margin-left: 93px;
  display: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? 'auto' : 'none')};
`;

const DropdownItem = styled('div')`
  background-color: ${({ hightlighted }: { hightlighted: boolean }) =>
    hightlighted ? '#dcdcdc' : 'white'};
  :hover {
    background-color: #dcdcdc;
  }
  font-size: 14px;
  font-weight: bold;
  padding: 7px 15px 7px 15px;
  border-left: 1px solid #c4c4c4;
  color: #121212;
`;

const FilterTitle = styled('label')`
  font-size: 16px;
  font-weight: bold;
  color: #121212;
  width: min-content;
  white-space: nowrap;
  margin-right: 9px;
`;

const FilterPlaceHolderText = styled('div')`
  display: inline-block;
  background-color: transparent;
  color: #808080;
  cursor: pointer;
  border: none;
  padding: 0;
  font-size: 16px;
  font-size: 16px;
`;

const FilterContainer = styled('div')`
  border-bottom: solid 2px #c4c4c4;
  padding: 2px;
  padding-top: 24px;
  margin-right: 19px;
  display: flex;
  justify-content: space-between;
`;

// The extension here is the result of JSX ambiguity -
// see https://github.com/Microsoft/TypeScript/issues/4922.
const CAPIFieldFilter = <T extends { value: string; id: string }>({
  onChange,
  items,
  placeholder,
  filterTitle
}: CAPIFieldFilterProps<T>) => (
  <Downshift
    itemToString={item => (item ? item.id : '')}
    onChange={value => {
      return onChange(value);
    }}
  >
    {({
      getItemProps,
      getLabelProps,
      getMenuProps,
      getToggleButtonProps,
      isOpen,
      highlightedIndex
    }) => (
      <div>
        <FilterContainer>
          <div
            style={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <FilterTitle {...getLabelProps()}>
                {startCase(filterTitle)}:
              </FilterTitle>
              <FilterPlaceHolderText {...getToggleButtonProps()}>
                {placeholder}
              </FilterPlaceHolderText>
            </div>
            <ButtonCircularCaret
              {...getToggleButtonProps()}
              active={isOpen}
              style={{ position: 'relative', bottom: '2px' }}
            />
          </div>
        </FilterContainer>

        <FilterFieldDropdownMenu isOpen={isOpen} {...getMenuProps()}>
          {!isOpen
            ? null
            : items.map((item, index) => (
                <DropdownItem
                  {...getItemProps({
                    key: item.id,
                    item,
                    index
                  })}
                  highlighted={highlightedIndex === index}
                >
                  {item.id}
                </DropdownItem>
              ))}
        </FilterFieldDropdownMenu>
      </div>
    )}
  </Downshift>
);

CAPIFieldFilter.defaultProps = {
  placeholder: 'Select field filters'
};

export default CAPIFieldFilter;
