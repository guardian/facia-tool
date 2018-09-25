// @flow

import * as React from 'react';
import styled from 'styled-components';

import moreImage from 'shared/images/icons/more.svg';
import searchImage from 'shared/images/icons/search.svg';

const InputWrapper = styled('div')`
  position: relative;
  width: ${({ width }) => width || 'auto'};
  display: flex;
  border: solid 1px #c9c9c9;
  backgroud: #fffff;
`;

const TagItem = styled('div')`
  color: #121212;
  font-weight: bold;
  border: solid 1px #c4c4c4;
  font-size: 12px;
  background-color: #ffffff;
  padding: 7px 15px 7px 15px;
  border-top: solid 1px #121212;
  margin: 5px;
  :hover {
    color: #c4c4c4;
  }
`;

const Input = styled(`input`)`
  appearance: none;
  background: #fff;
  border: none;
  width: 100%;
  height: 50px;
  padding: 9px 85px 9px 9px;
  font-size: 16px;

  :focus {
    outline: none;
  }

  &::placeholder
    color: rgba(255, 255, 255, 0.75);
  }
`;

const SmallRoundButton = styled('button')`
  appearance: none;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  width: 32px;
  height: 32px;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  border-radius: 100%;
  transition: background-color 0.15s;

  ::before {
    font-size: 1em;
    line-height: 1;
  }

  :focus {
    outline: none;
    font-weight: bold;
  }
`;

const SmallRoundButtonOrange = SmallRoundButton.extend`
  background-color: #ff7f0f;
  margin-right: 4px;
  padding: 4px;
  :hover {
    background-color: #ff983f;
  }
`;

const SmallRoundButtonBlack = SmallRoundButton.extend`
  background-color: #333333;
  :hover {
    background-color: #505050;
`;

const ButtonsContainer = styled('div')`
  position: absolute;
  top: 9px;
  right: 8px;
`;

const ClearButtonIcon = styled('img')`
  transform: rotate(45deg);
  vertical-align: middle;
  margin-right: 4px;
`;

const SearchButtonIcon = styled('img')`
  vertical-align: middle;
`;

type TextInputProps = {
  onClear?: () => void,
  onSearch?: () => void,
  onDisplaySearchFilters?: () => void,
  width?: string,
  searchTermsExist: boolean,
  searchTerms: Array<string>,
  onClearTag: string => void
};

const TextInput = ({
  onClear,
  onSearch,
  searchTermsExist,
  onDisplaySearchFilters,
  searchTerms,
  onClearTag,
  ...props
}: TextInputProps) => (
  <InputWrapper>
    {searchTerms.map(searchTerm => (
      <TagItem key={searchTerm}>
        <span>{searchTerm}</span>
        <SmallRoundButton
          onClick={() => onClearTag(searchTerm)}
          title="Clear search"
        >
          <ClearButtonIcon
            src={moreImage}
            onClick={() => onClearTag(searchTerm)}
            alt=""
            height="22px"
            width="22px"
          />
        </SmallRoundButton>
      </TagItem>
    ))}
    <Input {...props} />
    <ButtonsContainer>
      {onClear &&
        searchTermsExist && (
          <SmallRoundButtonOrange onClick={onSearch} title="Clear search">
            <ClearButtonIcon
              src={moreImage}
              onClick={onClear}
              alt=""
              height="22px"
              width="22px"
            />
          </SmallRoundButtonOrange>
        )}
      {onDisplaySearchFilters && (
        <SmallRoundButtonBlack onClick={onDisplaySearchFilters} title="Search">
          <SearchButtonIcon
            src={searchImage}
            onClick={onSearch}
            alt=""
            height="22px"
            width="22px"
          />
        </SmallRoundButtonBlack>
      )}
    </ButtonsContainer>
  </InputWrapper>
);

export default TextInput;
