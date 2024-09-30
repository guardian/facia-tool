import React from 'react';
import { theme } from 'constants/theme';
interface IconProps {
	fill?: string;
	size?: number;
}

// Card Hover Action Icons //

const AddToClipboardHoverIcon = ({
	fill = theme.colors.white,
	size = 10,
}: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width={size}
		height={size}
		viewBox="0 0 10 10"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>add-to-clipboard</title>
		<path fill={fill} d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" />
	</svg>
);

const CopyHoverIcon = ({ fill = theme.colors.white, size = 10 }: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width={size}
		height={size}
		viewBox="0 0 10 10"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>copy</title>
		<path fill={fill} d="M8 2H2v6H0V0h8v2zM3 3h7v7H3V3z" />
	</svg>
);

const PasteSublinkHoverIcon = ({
	fill = theme.colors.white,
	size = 10,
}: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width={size}
		height={size}
		viewBox="0 0 10 10"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>paste-sublink</title>
		<path
			fill={fill}
			d="M6.011 6.357l2.6-2.495L10 5.195 6.386 8.664l.003.003L5 10 0 5.2l1.39-1.333 2.604 2.5V0H6.01v6.357z"
		/>
	</svg>
);

const OphanHoverIcon = ({
	fill = theme.colors.white,
	size = 10,
}: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width={size}
		height={size}
		viewBox="0 0 10 10"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>ophan</title>
		<path fill={fill} d="M0 5h2v5H0V5zm3-3h2v8H3V2zm3-2h2v10H6V0z" />
	</svg>
);

const ViewHoverIcon = ({ fill = theme.colors.white }: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width="18"
		height="12"
		viewBox="0 0 18 12"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>view</title>
		<path
			fill={fill}
			fillRule="evenodd"
			d="M17 29c3.989 0 9 5.298 9 5.298v.961s-5.011 5.298-9 5.298-9-5.298-9-5.298v-.961S13.011 29 17 29zm0 9.634c2.127 0 3.866-1.718 3.866-3.845A3.863 3.863 0 0 0 17 30.923a3.863 3.863 0 0 0-3.866 3.866c0 2.127 1.739 3.845 3.866 3.845zm0-5.134c0 .695.573 1.289 1.289 1.289h.634A1.92 1.92 0 0 1 17 36.71a1.92 1.92 0 0 1-1.923-1.922c0-1.084.86-1.944 1.923-1.944v.655z"
			transform="translate(-8 -28)"
		/>
	</svg>
);

const DeleteHoverIcon = ({
	fill = theme.colors.white,
	size = 10,
}: IconProps) => (
	<svg
		style={{ pointerEvents: 'none' }}
		width={size}
		height={size}
		viewBox="0 0 10 10"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>delete</title>
		<path
			fill={fill}
			d="M6.485 5.071L9.314 7.9 7.899 9.314 5.071 6.485 2.243 9.314.828 7.899l2.829-2.828L.828 2.243 2.243.828 5.07 3.657 7.9.828l1.415 1.415L6.485 5.07z"
		/>
	</svg>
);

export {
	AddToClipboardHoverIcon,
	CopyHoverIcon,
	PasteSublinkHoverIcon,
	OphanHoverIcon,
	ViewHoverIcon,
	DeleteHoverIcon,
};
