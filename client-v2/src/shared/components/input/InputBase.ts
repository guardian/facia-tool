import { styled } from 'shared/constants/theme';
import { theme } from 'constants/theme';

export default styled('input')`
  display: block;
  appearance: none;
  height: ${theme.shared.input.height};
  padding: ${theme.shared.input.paddingY} ${theme.shared.input.paddingX};
  font-size: ${theme.shared.input.fontSize};
  color: ${theme.shared.input.color};
  background-color: ${theme.shared.input.backgroundColor};
  border: 1px solid ${theme.shared.input.borderColor};
  width: 100%;
  background-clip: padding-box;
  ::placeholder {
    color: ${theme.shared.input.placeholderText};
  }
  :focus {
    outline: none;
    border: solid 1px ${theme.shared.input.borderColorFocus};
  }
`;
