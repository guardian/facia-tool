import React from 'react';
import ButtonCircular from './ButtonCircular';
import Link from '../Link';
import { getPaths } from '../../../util/paths';
import { ButtonPropsFromWrapper } from './HoverActionButtonWrapper';
import {
  AddToClipboardHoverIcon,
  OphanHoverIcon,
  ViewHoverIcon,
  DeleteHoverIcon
} from '../icons/HoverIcons';

const ActionButton = ButtonCircular.extend<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger
      ? theme.shared.button.backgroundColorHighlight
      : theme.shared.button.backgroundColor};
  color: ${({ theme }) => theme.shared.button.color};
  margin: 0 2px 2px 2px;
  line-height: 1;
  &:hover {
    background: ${({ danger, theme }) =>
      danger
        ? theme.shared.button.backgroundColorHighlightFocused
        : theme.shared.button.backgroundColorFocused};
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
    <DeleteHoverIcon />
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
    <AddToClipboardHoverIcon />
  </ActionButton>
);

const HoverViewButton = ({
  isLive,
  urlPath = '',
  showToolTip,
  hideToolTip
}: ButtonProps) => (
  <Link
    onClick={e => {
      e.stopPropagation();
    }}
    href={isLive ? getPaths(urlPath).live : getPaths(urlPath).preview}
  >
    <ActionButton onMouseEnter={showToolTip} onMouseLeave={hideToolTip}>
      <ViewHoverIcon />
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
      onClick={e => {
        e.stopPropagation();
      }}
      href={getPaths(`https://www.theguardian.com/${urlPath}`).ophan}
      data-testid={'ophan-hover-button'}
    >
      <ActionButton onMouseEnter={showToolTip} onMouseLeave={hideToolTip}>
        <OphanHoverIcon />
      </ActionButton>
    </Link>
  ) : null;

export {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton,
  HoverAddToClipboardButton
};
