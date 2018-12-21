import React from 'react';
import Downshift, { GetInputPropsOptions } from 'downshift';
import capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import TagQuery, { AsyncState, CAPITagQueryReponse } from '../CAPI/TagQuery';
import { Tag } from 'types/Capi';

type SearchTypes = 'tags' | 'sections' | 'desks';

interface CAPITagInputProps<T> {
  onChange: (value: T, type: SearchTypes) => void;
  onSearchChange: (
    value: React.FormEvent<HTMLInputElement>,
    type: SearchTypes
  ) => void;
  placeholder?: string;
  tagsSearchTerm: string;
  searchType: SearchTypes;
}

const TagDropdown = styled('div')`
  margin-right: 19px;
`;

const DropdownItem = styled('div')`
  background-color: ${({ highlighted }: { highlighted: boolean }) =>
    highlighted ? '#dcdcdc' : 'white'};
  :hover {
    background-color: #dcdcdc;
  }
  font-size: 14px;
  font-weight: bold;
  padding: 7px 15px 7px 15px;
  border-left: 1px solid #c4c4c4;
  color: #121212;
`;

const SearchTitle = styled('label')`
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
  >
    {({
      getInputProps,
      getLabelProps,
      getMenuProps,
      getItemProps,
      isOpen,
      inputValue,
      highlightedIndex
    }) => (
      <div>
        <SearchContainer>
          <SearchTitle {...getLabelProps()}>
            {capitalize(searchType)}:
          </SearchTitle>
          <SearchInput
            {...getInputProps({
              placeholder,
              width: '100%',
              value: tagsSearchTerm,
              onChange: (input: any) => {
                onSearchChange(input, searchType);
              }
            }) as GetInputPropsOptions & { ref: any }}
          />
        </SearchContainer>
        <TagDropdown {...getMenuProps()}>
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
                        index
                      })}
                      highlighted={highlightedIndex === index}
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
  </Downshift>
);

CAPITagInput.defaultProps = {
  placeholder: 'Type tag name'
};

export { SearchTypes, AsyncState, CAPITagQueryReponse };

export default CAPITagInput;
