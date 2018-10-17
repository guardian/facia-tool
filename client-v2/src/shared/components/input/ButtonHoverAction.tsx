import React from 'react';
import styled from 'styled-components';
import ButtonCircular from './ButtonCircular';
import {
  View,
  Ophan,
  Copy,
  Paste,
  Clipboard,
  Delete
} from '../../images/icons-hover/index';

const hoverActionIcons = {
  view: View,
  ophan: Ophan,
  copy: Copy,
  paste: Paste,
  clipboard: Clipboard,
  delete: Delete
};

const Icon = styled('img')`
  width: 10px;
  display: inline-block;
  vertical-align: middle;
`;

const ActionButton = ButtonCircular.extend<{
  danger?: boolean;
}>`
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

type Props = {
  action: 'view' | 'ophan' | 'copy' | 'paste' | 'clipboard' | 'delete';
  title: string;
  danger?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const ButtonHoverAction = (props: Props) => (
  <ActionButton {...props}>
    <Icon src={hoverActionIcons[props.action]} alt={`${props.action}`} />
  </ActionButton>
);

export default ButtonHoverAction;
