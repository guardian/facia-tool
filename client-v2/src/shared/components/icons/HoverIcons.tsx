import React from 'react';
import { theme } from 'shared/constants/theme';
interface IconProps {
  fill?: string;
  size?: number;
}

// Article Fragment Hover Action Icons //

const AddToClipboardHoverIcon = ({
  fill = theme.colors.white,
  size = 10
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
  size = 10
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
  size = 10
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

const ViewHoverIcon = ({ fill = theme.colors.white, size = 10 }: IconProps) => (
  <svg
    style={{ pointerEvents: 'none' }}
    width={size}
    height={size}
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>view</title>
    <path
      fill={fill}
      d="M6.357 3.989l-2.495-2.6L5.195 0l3.469 3.614.003-.003L10 5 5.2 10 3.868 8.61l2.5-2.604H0V3.99h6.357z"
    />
  </svg>
);

const DeleteHoverIcon = ({
  fill = theme.colors.white,
  size = 10
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
  DeleteHoverIcon
};
