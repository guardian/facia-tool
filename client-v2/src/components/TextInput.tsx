import React from 'react';
import { styled } from 'constants/theme';
import moreImage from 'shared/images/icons/more.svg';
import searchImage from 'shared/images/icons/search.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';

const InputWrapper = styled('div')`
  position: relative;
  width: ${({ width }: { width?: number }) => width || 'auto'};
  display: flex;
  border: ${({ theme }) => `solid 1px ${theme.shared.input.borderColor}`};
  background: ${({ theme }) => theme.shared.input.backgroundColor};
`;

const Input = styled(`input`)`
  background: ${({ theme }) => theme.shared.input.backgroundColor};
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

const SmallRoundButtonOrange = styled(SmallRoundButton)`
  background-color: ${({ theme }) =>
    theme.shared.button.backgroundColorHighlight};
  margin-right: 4px;
  padding: 4px;
  :hover {
    background-color: ${({ theme }) =>
      theme.shared.button.backgroundColorHighlightFocused};
  }
`;

const SmallRoundButtonBlack = styled(SmallRoundButton)`
  background-color: ${({ theme }) => theme.shared.button.backgroundColor};
  :hover {
    background-color: ${({ theme }) =>
      theme.shared.button.backgroundColorFocused};
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
      {onClear && searchTermsExist && (
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
