import * as React from 'react';
import Downshift from 'downshift';
import capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import TagQuery from '../CAPI/TagQuery';
import { Tag } from 'types/Capi';

type CAPITagInputProps<T> = {
  onChange: (value: T, type: string) => void;
  onSearchChange: (value: T, type: string) => void;
  placeholder?: string;
  tagsSearchTerm: string;
  searchType: 'tags' | 'sections';
};

const TagDropdown = styled('div')`
  margin-right: 19px;
`;

const DropdownItem = styled('div')`
  background-color: ${({ selected }: { selected: boolean }) =>
    selected ? '#dcdcdc' : 'white'};
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
  font-size: 16px;
  font-weight: bold;
  color: #121212;
  margin-right: 3px;
`;

const SearchInput = styled('input')`
  background-color: transparent;
  border: none;
  width: 109px;
  padding-left: 5px;
  font-size: 16px;
  flex: 1;
  :focus {
    outline: none;
  }
  &::placeholder {
    font-size: 16px;
  }
`;

const SearchContainer = styled('div')`
  border-bottom: solid 2px #c4c4c4;
  padding: 2px;
  padding-top: 24px;
  margin-right: 19px;
  display: flex;
`;

// The extension here is the result of JSX ambiguity -
// see https://github.com/Microsoft/TypeScript/issues/4922.
const CAPITagInput = <T extends any>({
  onChange,
  onSearchChange,
  placeholder,
  tagsSearchTerm,
  searchType
}: CAPITagInputProps<T>) => (
  <Downshift
    itemToString={item => (item ? item.id : '')}
    onChange={value => {
      onChange(value, searchType);
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
          <SearchTitle>{capitalize(searchType)}:</SearchTitle>
          <SearchInput
            {...getInputProps({
              placeholder,
              onClear: clearSelection,
              width: '100%',
              value: tagsSearchTerm,
              onChange: input => {
                onSearchChange(input, searchType);
              }
            })}
          />
        </SearchContainer>
        <TagDropdown>
          <TagQuery tagType={searchType} params={{ q: inputValue }}>
            {({ value }: any) => {
              if (!value || !isOpen) {
                return false;
              }

              /**
               * Filter tags based on ids
               * think this is only for the test/test tag but sometime tags
               * come through more than once
               */
              const seenIds: string[] = [];

              return value.response.results.map((tag: Tag, index: number) => {
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
