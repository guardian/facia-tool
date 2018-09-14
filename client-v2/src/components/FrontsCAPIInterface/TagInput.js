// @flow

import * as React from 'react';
import Downshift from 'downshift';
import styled from 'styled-components';
import TagQuery from '../CAPI/TagQuery';

type CAPITagInputProps<T> = {
  onChange: (value: T) => void,
  placeholder?: string
};

const DragContainer = styled('div')`
  width: 100%
`;

const TagDropdown = styled('div')`
`;

const DropdownItem = styled('div')`
  background-color: ${({ selected }) => (selected ? '#dcdcdc' : 'white')};
  :hover {
    background-color: #dcdcdc
  }
  font-size: 14px;
  front-weight: bold;
  padding: 7px; 15px; 7px; 15px;
  border-left: 1px solid #c4c4c4;
  color: #121212;
`;

const SearchTitle = styled('span')`
  width: 39px;
  height: 20px;
  font-family: TS3TextSans;
  font-size: 16px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #121212;
  margin-right: 3px;
`;

const SearchInput = styled('input')`
  type: 'text';
  background-color: transparent;
  border: none;
  width: 109px;
  height: 20px;
  &::-webkit-input-placeholder {
    font-family: TS3TextSans;
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
  }
`;

const SearchContainer = styled('div')`
  border-bottom: solid 2px #c4c4c4;
  padding: 2px;
`;

const CAPITagInput = <T>({ onChange, placeholder }: CAPITagInputProps<T>) => (
  <Downshift
    itemToString={item => (item ? item.id : '')}
    onChange={(value) => {
      onChange(value);
      value = null;
    }}
    render={({
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      selectedItem,
      highlightedIndex,
      clearSelection
    }) => (
      <div>
        <SearchContainer>
          <SearchTitle>Tags:</SearchTitle>
          <SearchInput
            {...getInputProps({
              placeholder,
              onClear: clearSelection,
              width: '100%'
            })}
          />
        </SearchContainer>
        <TagDropdown>
          <TagQuery params={{ q: inputValue }}>
            {({ value }) => {
              if (!value || !isOpen) {
                return false;
              }

              /**
               * Filter tags based on ids
               * think this is only for the test/test tag but sometime tags
               * come
               */
              const seenIds = [];

              return value.response.results.map((tag, index) => {
                const wasSeen = seenIds.indexOf(tag.id);
                seenIds.push();
                return (
                  wasSeen && (
                    <DropdownItem
                      {...getItemProps({
                        item: tag,
                        highlighted: highlightedIndex === index,
                        selected: selectedItem === tag
                      })}
                      key={tag.id}
                    >
                      {tag.id}
                    </DropdownItem>
                  )
                );
              });
            }}
          </TagQuery>
        </TagDropdown>
      </div>
    )}
  />
);

CAPITagInput.defaultProps = {
  placeholder: 'Type tag name'
};

export default CAPITagInput;
