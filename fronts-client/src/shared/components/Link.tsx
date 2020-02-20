import { styled } from 'constants/theme-shared';

export default styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;

  &:focus {
    outline: 1px solid ${props => props.theme.shared.base.colors.focusColor};
  }
`;
