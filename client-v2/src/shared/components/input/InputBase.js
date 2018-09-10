// @flow

import styled from 'styled-components';

export default styled('input')`
  display: block;
  appearance: none;
  height: ${props => props.theme.input.height};
  padding: ${props => props.theme.input.paddingY}
    ${props => props.theme.input.paddingX};
  font-size: ${props => props.theme.input.fontSize};
  color: ${props => props.theme.input.color};
  background-color: ${props => props.theme.input.backgroundColor};
  border: 1px solid ${props => props.theme.input.borderColor};
  width: 100%;
  background-clip: padding-box;
  ${props => props.useHeadlineFont && `font-family: GHGuardianHeadline-Medium`};
  ::placeholder {
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
  }
  :focus {
    outline: none;
    border: solid 1px ${props => props.theme.input.borderColorFocus};
  }
`;
