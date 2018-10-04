// @flow
import * as React from 'react';
import styled from 'styled-components';
import hoverActionIcons from '../../images/icons-hover/index';

const Icon = styled('img')`
  width: 10px;
  display: inline-block;
  vertical-align: middle;
`;

const ActionButton = styled('button')`
  appearance: none;
  background: ${({ danger }) => (danger ? '#ff7f0f' : '#333333')};
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  height: 24px;
  line-height: 1;
  margin: 0;
  width: 24px;

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
  </ActionButton>
);

export default ButtonHoverAction;
