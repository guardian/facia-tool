import { styled } from 'constants/theme-shared';
import { theme } from 'constants/theme';

export default styled.button`
  cursor: pointer;
  font-family: TS3TextSans;
  font-weight: bold;
  font-size: 12px;
  padding: 0 6px 0 8px;
  border: ${`solid 1px ${theme.shared.colors.greyMediumLight}`};
  border-radius: 20px;
  :focus {
    outline: none;
  }
  & svg {
    vertical-align: middle;
  }
  :hover:enabled {
    background-color: ${theme.shared.base.colors.backgroundColorFocused};
  }
  :disabled,
  :disabled:hover {
    cursor: not-allowed;
  }
`;

export const ButtonLabel = styled.div`
  display: inline-block;
  vertical-align: middle;
`;
