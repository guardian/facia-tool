import { styled } from 'shared/constants/theme';

export default styled('input')<{
  useHeadlineFont?: boolean;
}>`
  display: block;
  appearance: none;
  height: ${props => props.theme.shared.input.height};
  padding: ${props => props.theme.shared.input.paddingY}
    ${props => props.theme.shared.input.paddingX};
  font-size: ${props =>
    props.useHeadlineFont
      ? props.theme.shared.input.fontSizeHeadline
      : props.theme.shared.input.fontSize};
  color: ${props => props.theme.shared.input.color};
  background-color: ${props => props.theme.shared.input.backgroundColor};
  border: 1px solid ${props => props.theme.shared.input.borderColor};
  width: 100%;
  background-clip: padding-box;
  ${props =>
    props.useHeadlineFont &&
    `font-family: GHGuardianHeadline; font-weight: 500`};
  ::placeholder {
    color: ${props => props.theme.shared.input.placeholderText};
  }
  :focus {
    outline: none;
    border: solid 1px ${props => props.theme.shared.input.borderColorFocus};
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
