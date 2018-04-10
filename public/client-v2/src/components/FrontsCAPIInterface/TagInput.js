// @flow

import * as React from 'react';
import Downshift from 'downshift';
import styled from 'styled-components';
import TagQuery from '../FrontsCAPI/TagQuery';
import TextInput from '../TextInput';

type CAPITagInputProps<T> = {
  onChange: (value: T) => void,
  placeholder?: string
};

const TagWrapper = styled('div')`
  position: relative;
`;

const TagDropdown = styled('div')`
  background-color: #213;
  position: absolute;
`;

const DropdownItem = styled('div')`
  background-color: ${({ selected }) => (selected ? 'white' : 'transparent')};
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
  color: ${({ selected }) => (selected ? '#213' : 'white')};
  font-weight: ${({ highlighted }) => (highlighted ? '700' : '300')};
  padding: 0.5em;

  &:first-child {
    border-top: 1px solid #fff;
  }

  &:last-child {
    border-bottom: 1px solid #fff;
  }
`;

const CAPITagInput = <T>({ onChange, placeholder }: CAPITagInputProps<T>) => (
  <Downshift
    itemToString={item => (item ? item.id : '')}
    onChange={onChange}
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
        <TagWrapper>
          <TextInput
            {...getInputProps({
              placeholder,
              onClear: clearSelection,
              width: '100%'
            })}
          />
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
        </TagWrapper>
      </div>
    )}
  />
);

CAPITagInput.defaultProps = {
  placeholder: ''
};

export default CAPITagInput;
