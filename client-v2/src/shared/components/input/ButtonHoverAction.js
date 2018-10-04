// @flow
import * as React from 'react';
import styled from 'styled-components';
import ButtonCircular from './ButtonCircular';
import hoverActionIcons from '../../images/icons-hover/index';

const Link = styled(`a`).attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;
`;

const Icon = styled('img')`
  width: 10px;
  display: inline-block;
  vertical-align: middle;
`;

const ActionButton = ButtonCircular.extend`
  background: ${({ danger }) => (danger ? '#ff7f0f' : '#333333')};
  color: #fff;
  margin: 1.5px;
  line-height: 1;
  &:hover {
    background: ${({ danger }) => (danger ? '#e05e00' : '#767676')};
  }
`;

ActionButton.defaultProps = {
  danger: false
};

const ButtonHoverAction = ({ action, ...props }: { action: string }) => (
  <ActionButton {...props}>
    <Icon src={hoverActionIcons[action]} alt="" />
    {/* TODO: add links */}
    {action === 'view' || action === 'ophan' ? (
      <Link href="www.example.com" />
    ) : null}
  </ActionButton>
);

export default ButtonHoverAction;
