// @flow

import * as React from 'react';
import styled from 'styled-components';

import moreImage from 'shared/images/icons/more.svg';
import searchImage from 'shared/images/icons/search.svg';

const InputWrapper = styled('div')`
  position: relative;
  width: ${({ width }) => width || 'auto'};
`;

const Input = styled(`input`)`
  appearance: none;
  background: #fff;
  border: solid 1px #c9c9c9;
  width: 100%;
  height: 50px;
  padding: 9px 85px 9px 9px;
  font-size: 16px;

  :focus {
    border: solid 1px #a9a9a9;
    outline: none;
  }

  ::placeholder {
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
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
  onDisplaySearchFilters?: () => void,
  width?: string,
  displayClear: boolean
};

const TextInput = ({
  onClear,
  displayClear,
  onDisplaySearchFilters,
  ...props
}: TextInputProps) => (
  <InputWrapper>
    <Input {...props} />
    <ButtonsContainer>
      {onClear &&
        displayClear && (
          <SmallRoundButtonOrange onClick={onClear} title="Clear search">
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
            onClick={onClear}
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
