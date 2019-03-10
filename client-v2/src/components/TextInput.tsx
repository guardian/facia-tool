import React from 'react';
import { styled } from 'constants/theme';
import {
  MagnifyingGlassIcon as SearchIcon,
  ClearIcon
} from 'shared/components/icons/Icons';
import { SmallRoundButton } from 'util/sharedStyles/buttons';

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

const SearchButtonIcon = styled('div')`
  vertical-align: middle;
`;
const ClearButtonIcon = styled('div')`
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
          <ClearButtonIcon onClick={onClear}>
            <ClearIcon size={22} />
          </ClearButtonIcon>
        </SmallRoundButtonOrange>
      )}
      {onDisplaySearchFilters && (
        <SmallRoundButtonBlack onClick={onDisplaySearchFilters} title="Search">
          <SearchButtonIcon onClick={onSearch}>
            <SearchIcon size={22} />
          </SearchButtonIcon>
        </SmallRoundButtonBlack>
      )}
    </ButtonsContainer>
  </InputWrapper>
);

export default TextInput;
