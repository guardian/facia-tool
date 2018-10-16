import React from 'react';
import styled from 'styled-components';
import moreImage from 'shared/images/icons/more.svg';
import searchImage from 'shared/images/icons/search.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';

const InputWrapper = styled('div')`
  position: relative;
  width: ${({ width }: { width?: number }) => width || 'auto'};
  display: flex;
  border: solid 1px #c9c9c9;
  backgroud: #fffff;
`;

const Input = styled(`input`)`
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
  }
`;

const ButtonsContainer = styled('div')`
  position: absolute;
  top: 9px;
  right: 8px;
`;

const SearchButtonIcon = styled('img')`
  vertical-align: middle;
`;

interface TextInputProps {
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onClearTag?: (searchTerm: string) => void;
  onSearch?: () => void;
  onDisplaySearchFilters?: () => void;
  width?: string;
  searchTermsExist: boolean;
}

const TextInput = ({
  onClear,
  onSearch,
  searchTermsExist,
  onDisplaySearchFilters,
  ...props
}: TextInputProps) => (
  <InputWrapper>
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
