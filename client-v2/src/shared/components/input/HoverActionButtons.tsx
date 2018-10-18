import React from 'react';
import styled from 'styled-components';
import ButtonCircular from './ButtonCircular';
import { getPaths } from '../../../util/paths';
import { ButtonPropsForWrapper } from './HoverActionButtonWrapper';

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

const Link = styled(`a`).attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;
`;

const ActionButton = ButtonCircular.extend`
  background: ${({ danger }: { danger?: boolean }) =>
    danger ? '#ff7f0f' : '#333333'};
  color: #fff;
  margin: 1.5px;
  line-height: 1;
  &:hover {
    background: ${({ danger }: { danger?: boolean }) =>
      danger ? '#e05e00' : '#767676'};
  }
`;

ActionButton.defaultProps = {
  danger: false
};

export interface ButtonPropsForArticle {
  isLive?: boolean;
  urlPath?: string;
  onDelete?: () => void;
}

type ButtonProps = ButtonPropsForArticle & ButtonPropsForWrapper;

const HoverDeleteButton = ({
  showToolTip,
  hideToolTip,
  onDelete
}: ButtonProps) => (
  <ActionButton
    danger
    onMouseEnter={showToolTip}
    onMouseLeave={hideToolTip}
    onClick={e => {
      e.stopPropagation();
      onDelete && onDelete();
    }}
  >
    <Icon src={hoverActionIcons.delete} alt="Delete" />
  </ActionButton>
);

const HoverViewButton = ({
  isLive,
  urlPath,
  showToolTip,
  hideToolTip
}: ButtonProps) => (
  <Link
    href={
      isLive
        ? `https://www.theguardian.com/${urlPath}`
        : `https://preview.gutools.co.uk/${urlPath}`
    }
  >
    <ActionButton onMouseEnter={showToolTip} onMouseLeave={hideToolTip}>
      <Icon src={hoverActionIcons.view} alt="View" />
    </ActionButton>
  </Link>
);

const HoverOphanButton = ({
  isLive,
  urlPath,
  showToolTip,
  hideToolTip
}: ButtonProps) =>
  isLive ? (
    <Link href={getPaths(`https://www.theguardian.com/${urlPath}`).ophan}>
      <ActionButton onMouseEnter={showToolTip} onMouseLeave={hideToolTip}>
        <Icon src={hoverActionIcons.ophan} alt="Ophan" />
      </ActionButton>
    </Link>
  ) : null;

export { HoverDeleteButton, HoverViewButton, HoverOphanButton };
