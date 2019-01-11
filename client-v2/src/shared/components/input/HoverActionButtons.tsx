import React from 'react';
import styled from 'styled-components';
import ButtonCircular from './ButtonCircular';
import Link from '../Link';
import { getPaths } from '../../../util/paths';
import { ButtonPropsFromWrapper } from './HoverActionButtonWrapper';

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

const ActionButton = ButtonCircular.extend<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger
      ? theme.button.backgroundColorHighlight
      : theme.button.backgroundColor};
  color: ${({ theme }) => theme.button.color};
  margin: 1.5px;
  margin-bottom: 2px;
  line-height: 1;
  &:hover {
    background: ${({ danger, theme }) =>
      danger
        ? theme.button.backgroundColorHighlightFocused
        : theme.button.backgroundColorFocused};
  }
`;

ActionButton.defaultProps = {
  danger: false
};

interface ButtonPropsFromArticle {
  isLive?: boolean;
  urlPath?: string;
  onDelete?: () => void;
  onAddToClipboard?: () => void;
}

type ButtonProps = ButtonPropsFromArticle & ButtonPropsFromWrapper;

const HoverDeleteButton = ({
  showToolTip,
  hideToolTip,
  onDelete
}: ButtonProps) => (
  <ActionButton
    danger
    data-testid={'delete-hover-button'}
    onMouseEnter={showToolTip}
    onMouseLeave={hideToolTip}
    onClick={e => {
      e.stopPropagation();
      return onDelete && onDelete();
    }}
  >
    <Icon src={hoverActionIcons.delete} alt="Delete" />
  </ActionButton>
);

const HoverAddToClipboardButton = ({
  showToolTip,
  hideToolTip,
  onAddToClipboard
}: ButtonProps) => (
  <ActionButton
    data-testid={'add-to-clipboard-hover-button'}
    onMouseEnter={showToolTip}
    onMouseLeave={hideToolTip}
    onClick={e => {
      e.stopPropagation();
      return onAddToClipboard && onAddToClipboard();
    }}
  >
    <Icon src={hoverActionIcons.clipboard} alt="Add to clipboard" />
  </ActionButton>
);

const HoverViewButton = ({
  isLive,
  urlPath = '',
  showToolTip,
  hideToolTip
}: ButtonProps) => (
  <Link href={isLive ? getPaths(urlPath).live : getPaths(urlPath).preview}>
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
    <Link
      href={getPaths(`https://www.theguardian.com/${urlPath}`).ophan}
      data-testid={'ophan-hover-button'}
    >
      <ActionButton onMouseEnter={showToolTip} onMouseLeave={hideToolTip}>
        <Icon src={hoverActionIcons.ophan} alt="Ophan" />
      </ActionButton>
    </Link>
  ) : null;

export {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton,
  HoverAddToClipboardButton
};
