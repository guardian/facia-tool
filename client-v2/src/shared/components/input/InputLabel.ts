import styled from 'styled-components';

export default styled('label')<{
  size?: 'sm';
  active?: boolean;
  for?: string;
}>`
  display: block;
  font-size: ${props =>
    props.size === 'sm'
      ? props.theme.label.fontSizeSmall
      : props.theme.label.fontSize};
  line-height: ${props => props.theme.label.lineHeight};
  font-weight: bold;
  ${props => !props.active && `color:`};
`;
