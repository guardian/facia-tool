import { styled } from 'shared/constants/theme';

export default styled('label')<{
  size?: 'sm';
  active?: boolean;
  for?: string;
}>`
  display: block;
  font-size: ${props =>
    props.size === 'sm'
      ? props.theme.shared.label.fontSizeSmall
      : props.theme.shared.label.fontSize};
  line-height: ${props => props.theme.shared.label.lineHeight};
  font-weight: bold;
  ${props => !props.active && `color:`};
`;
