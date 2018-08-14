// @flow

import * as React from 'react';
import styled from 'styled-components';

import moreImage from 'shared/images/icons/more.svg';

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
  :hover {
    background-color: #ff983f;
  }
`;

const ButtonsContainer = styled('div')`
  position: absolute;
  top: 9px;
  right: 8px;
`;

const ClearButtonIcon = styled('img')`
  transform: rotate(45deg);
  vertical-align: middle;
`;

type TextInputProps = {
  onClear?: () => void,
  width?: string
};

const TextInput = ({ onClear, ...props }: TextInputProps) => (
  <InputWrapper>
    <Input {...props} />
    {onClear && (
      <ButtonsContainer>
        <SmallRoundButtonOrange onClick={onClear} title="Clear search">
          <ClearButtonIcon
            src={moreImage}
            onClick={onClear}
            alt=""
            height="22px"
            width="22px"
          />
        </SmallRoundButtonOrange>
      </ButtonsContainer>
    )}
  </InputWrapper>
);

export default TextInput;
