import React from 'react';
import { styled, theme } from 'constants/theme';
import {
	MagnifyingGlassIcon as SearchIcon,
	ClearIcon,
} from 'components/icons/Icons';
import { SmallRoundButton } from 'util/sharedStyles/buttons';

const InputWrapper = styled.div`
	position: relative;
	width: ${({ width }: { width?: number }) => width || 'auto'};
	display: flex;
	border: ${`solid 1px ${theme.input.borderColor}`};
	background: ${theme.input.backgroundColor};
`;

const Input = styled.input`
  background: ${theme.input.backgroundColor};
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
	background-color: ${theme.button.backgroundColorHighlight};
	margin-right: 4px;
	padding: 4px;
	:hover {
		background-color: ${theme.button.backgroundColorHighlightFocused};
	}
`;

const ButtonsContainer = styled.div`
	position: absolute;
	top: 9px;
	right: 8px;
`;

const SearchButtonIcon = styled.div`
	display: inline-block;
	height: 32px;
	width: 32px;
	vertical-align: middle;
`;

const ClearButtonIcon = styled.div``;

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	onClear?: () => void;
	onSearch?: () => void;
	displaySearchIcon: boolean;
	searchTermsExist?: boolean;
}

const TextInput = ({
	onClear,
	onSearch,
	searchTermsExist = true,
	displaySearchIcon,
	...props
}: TextInputProps) => (
	<InputWrapper>
		<Input {...props} />
		<ButtonsContainer>
			{onClear && searchTermsExist && (
				<SmallRoundButtonOrange onClick={onSearch} title="Clear search">
					<ClearButtonIcon onClick={onClear}>
						<ClearIcon size={'l'} />
					</ClearButtonIcon>
				</SmallRoundButtonOrange>
			)}
			{displaySearchIcon && (
				<SearchButtonIcon>
					<SearchIcon size={'fill'} fill={theme.colors.blackLight} />
				</SearchButtonIcon>
			)}
		</ButtonsContainer>
	</InputWrapper>
);

export default TextInput;
