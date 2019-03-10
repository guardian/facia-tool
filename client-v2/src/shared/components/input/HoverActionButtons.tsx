import React from 'react';
import ButtonCircular from './ButtonCircular';
import Link from '../Link';
import { getPaths } from '../../../util/paths';
import { ButtonPropsFromWrapper } from './HoverActionButtonWrapper';
import Icon from '../icons/HoverIcons';

const ActionButton = ButtonCircular.extend<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger
      ? theme.shared.button.backgroundColorHighlight
      : theme.shared.button.backgroundColor};
  color: ${({ theme }) => theme.shared.button.color};
  margin: 1.5px;
  margin-bottom: 2px;
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
    <Icon name="delete" />
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
    <Icon name="add-to-clipboard" />
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
      <Icon name="view" />
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
        <Icon name="ophan" />
      </ActionButton>
    </Link>
  ) : null;

export {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton,
  HoverAddToClipboardButton
};
