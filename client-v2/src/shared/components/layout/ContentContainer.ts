import { styled } from '../../constants/theme';

export default styled('div')<{
  setBack?: boolean;
}>`
  background-color: ${({ setBack, theme }) =>
    setBack ? 'transparent' : theme.shared.base.colors.backgroundColor};
  position: relative;
  padding: 0 10px 10px 10px;
  box-shadow: ${({ theme }) => `0 -1px 0 ${theme.shared.base.colors.text}`};
  border: ${({ setBack, theme }) =>
    setBack ? 'none' : `1px solid ${theme.shared.base.colors.borderColor}`};
  border-top: none;
  & + & {
    margin-top: 10px;
  }
`;
