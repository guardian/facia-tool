import React from 'react';
import ButtonCircular from './ButtonCircular';
import Link from '../Link';
import { ButtonProps } from './HoverActionButtonWrapper';
import {
	AddToClipboardHoverIcon,
	OphanHoverIcon,
	ViewHoverIcon,
	DeleteHoverIcon,
} from '../icons/HoverIcons';
import styled from 'styled-components';
import { theme } from 'constants/theme';

const ActionButton = styled(ButtonCircular)<{ danger?: boolean }>`
	background: ${({ danger }) =>
		danger
			? theme.button.backgroundColorHighlight
			: theme.button.backgroundColor};
	color: ${theme.button.color};
	margin: 0 2px 2px 2px;
	line-height: 1;
	&:hover:enabled {
		background: ${({ danger }) =>
			danger
				? theme.button.backgroundColorHighlightFocused
				: theme.button.backgroundColorFocused};
	}
`;

ActionButton.defaultProps = {
	danger: false,
};

type ButtonPropsWithHoverText = ButtonProps & {
	hoverText: string;
};

const HoverDeleteButton = ({
	showToolTip,
	hideToolTip,
	onDelete,
	hoverText,
}: ButtonPropsWithHoverText & { onDelete: () => void }) => (
	<ActionButton
		danger
		data-testid={'delete-hover-button'}
		onMouseEnter={() => showToolTip(hoverText)}
		onMouseLeave={hideToolTip}
		onClick={(e: React.MouseEvent) => {
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
	onAddToClipboard,
	hoverText,
}: ButtonPropsWithHoverText & { onAddToClipboard: () => void }) => (
	<ActionButton
		data-testid={'add-to-clipboard-hover-button'}
		onMouseEnter={() => showToolTip(hoverText)}
		onMouseLeave={hideToolTip}
		onClick={(e: React.MouseEvent) => {
			e.stopPropagation();
			return onAddToClipboard && onAddToClipboard();
		}}
	>
		<AddToClipboardHoverIcon />
	</ActionButton>
);

const HoverViewButton = ({
	showToolTip,
	hideToolTip,
	href,
	hoverText,
}: ButtonPropsWithHoverText & {
	href?: string;
}) => (
	<Link
		onClick={(e: React.MouseEvent) => {
			e.stopPropagation();
		}}
		href={href}
	>
		<ActionButton
			tabIndex={-1}
			onMouseEnter={() => showToolTip(hoverText)}
			onMouseLeave={hideToolTip}
		>
			<ViewHoverIcon />
		</ActionButton>
	</Link>
);

const HoverOphanButton = ({
	href,
	showToolTip,
	hideToolTip,
	hoverText,
}: ButtonPropsWithHoverText & {
	href?: string;
}) => (
	<Link
		onClick={(e: React.MouseEvent) => {
			e.stopPropagation();
		}}
		href={href}
		data-testid={'ophan-hover-button'}
	>
		<ActionButton
			tabIndex={-1}
			onMouseEnter={() => showToolTip(hoverText)}
			onMouseLeave={hideToolTip}
		>
			<OphanHoverIcon />
		</ActionButton>
	</Link>
);
export {
	HoverDeleteButton,
	HoverViewButton,
	HoverOphanButton,
	HoverAddToClipboardButton,
};
