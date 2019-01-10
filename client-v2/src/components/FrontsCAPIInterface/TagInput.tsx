import React from 'react';
import Downshift, { GetInputPropsOptions } from 'downshift';
import capitalize from 'lodash/capitalize';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { Tag } from 'types/Capi';
import { liveCapi } from 'services/frontsCapi';

type SearchTypes = 'tags' | 'sections' | 'desks';

interface CAPITagInputProps {
  onSelect: (value: Tag, type: SearchTypes) => void;
  placeholder?: string;
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

class CAPITagInput extends React.Component<
  CAPITagInputProps,
  { input: string; tags: Tag[] }
> {
  public static defaultProps = {
    placeholder: 'Type tag name'
  };

  public state = {
    input: '',
    tags: []
  };

  private run: (value: string) => void;

  constructor(props: CAPITagInputProps) {
    super(props);
    this.run = debounce(this.updateTags, 250);
  }

  public render() {
    const { onSelect, placeholder, searchType } = this.props;

    /**
     * Filter tags based on ids
     * think this is only for the test/test tag but sometime tags
     * come through more than once
     */
    return (
      <Downshift
        defaultIsOpen={false}
        itemToString={item => (item ? item.id : '')}
        onSelect={value => {
          onSelect(value, searchType);
        }}
      >
        {({
          getInputProps,
          getLabelProps,
          getMenuProps,
          getItemProps,
          highlightedIndex,
          isOpen
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
                  value: this.state.input,
                  onChange: (input: any) => this.onSearchChange(input)
                }) as GetInputPropsOptions & { ref: any }}
              />
            </SearchContainer>
            <TagDropdown {...getMenuProps()}>
              {isOpen &&
                this.state.tags.reduce(
                  ({ els, seen }, tag: Tag, index: number) => {
                    const { id } = tag;
                    return seen.includes(id)
                      ? { els, seen }
                      : {
                          els: [
                            ...els,
                            <DropdownItem
                              {...getItemProps({
                                item: tag,
                                index
                              })}
                              highlighted={highlightedIndex === index}
                              key={id}
                            >
                              {id}
                            </DropdownItem>
                          ],
                          seen: [...seen, id]
                        };
                  },
                  { els: [], seen: [] } as {
                    els: React.ReactNode[];
                    seen: string[];
                  }
                ).els}
            </TagDropdown>
          </div>
        )}
      </Downshift>
    );
  }

  private async updateTags(q: string) {
    const tags = (await liveCapi[this.props.searchType]({ q })).response
      .results;
    this.setState({
      tags
    });
  }

  private onSearchChange(e: React.SyntheticEvent<HTMLInputElement>) {
    const { value } = e.currentTarget;
    this.setState(
      {
        input: value
      },
      () => this.run(value)
    );
  }
}

export { SearchTypes };

export default CAPITagInput;
