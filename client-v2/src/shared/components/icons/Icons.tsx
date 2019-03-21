import React from 'react';
import { theme } from 'shared/constants/theme';

interface IconProps {
  fill?: string;
  size?: IconSizes;
  title?: string | null;
}

type IconSizes = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'fill';
const IconSizeMap = {
  xxs: 10,
  xs: 12,
  s: 14,
  m: 18,
  l: 22,
  xl: 30,
  xxl: 40,
  fill: '100%'
};
const mapSize = (size: IconSizes): number | string => IconSizeMap[size];

const DownCaretIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = null
}: IconProps) => (
  <svg
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      d="M4 11.95L14.45 22.4h1L25.9 11.95l-.975-.95-9.975 8.4L4.975 11z"
    />
  </svg>
);

const RubbishBinIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = null
}: IconProps) => (
  <svg
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      d="M22.2 115.9L34.3 128h59.6l12.1-12.1V31.6H22.2v84.3zM113.9 7.1H89L81.9 0H46.3l-7.1 7.1H14.3v14.2h99.6V7.1z"
    />
  </svg>
);

const MagnifyingGlassIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = 'Search'
}: IconProps) => (
  <svg
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      d="M12 4c4.425 0 7.975 3.625 7.975 8A7.949 7.949 0 0 1 12 19.975c-4.425 0-8-3.55-8-7.975 0-4.375 3.575-8 8-8zm0 2.025A5.943 5.943 0 0 0 6.025 12c0 3.3 2.65 6 5.975 6 3.3 0 6-2.7 6-6 0-3.325-2.7-5.975-6-5.975zM20.025 18L26 23.975 23.975 26 18 20.025V19l1-1h1.025z"
    />
  </svg>
);

// block x
const CloseIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = null
}: IconProps) => (
  <svg
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      fill-rule="evenodd"
      d="M6.485 4.571L9.314 7.4 7.899 8.814 5.071 5.985 2.243 8.814.828 7.399l2.829-2.828L.828 1.743 2.243.328 5.07 3.157 7.9.328l1.415 1.415L6.485 4.57z"
    />
  </svg>
);

// tapered x
const ClearIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = null
}: IconProps) => (
  <svg
    style={{ transform: 'rotate(45deg)' }}
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      d="M13.8 16.2l.425 9.8h1.525l.45-9.8 9.8-.45v-1.525l-9.8-.425-.45-9.8h-1.525l-.425 9.8-9.8.425v1.525z"
    />
  </svg>
);

// tapered +
const MoreIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = null
}: IconProps) => (
  <svg
    width={mapSize(size)}
    height={mapSize(size)}
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <path
      fill={fill}
      d="M13.8 16.2l.425 9.8h1.525l.45-9.8 9.8-.45v-1.525l-9.8-.425-.45-9.8h-1.525l-.425 9.8-9.8.425v1.525z"
    />
  </svg>
);

const LockedPadlockIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = 'Locked'
}: IconProps) => (
  <svg width={mapSize(size)} height={mapSize(size)} viewBox="0 0 535 535">
    <title>{title}</title>
    <path
      fill={fill}
      d="M420.75,178.5h-25.5v-51c0-71.4-56.1-127.5-127.5-127.5c-71.4,0-127.5,56.1-127.5,127.5v51h-25.5c-28.05,0-51,22.95-51,51
			v255c0,28.05,22.95,51,51,51h306c28.05,0,51-22.95,51-51v-255C471.75,201.45,448.8,178.5,420.75,178.5z M267.75,408
			c-28.05,0-51-22.95-51-51s22.95-51,51-51s51,22.95,51,51S295.8,408,267.75,408z M346.8,178.5H188.7v-51
			c0-43.35,35.7-79.05,79.05-79.05c43.35,0,79.05,35.7,79.05,79.05V178.5z"
    />
  </svg>
);

const AddImageIcon = ({
  fill = theme.colors.white,
  size = 'm',
  title = 'Add mage'
}: IconProps) => (
  <svg width={mapSize(size)} height={mapSize(size)} viewBox="0 0 22 22">
    <title>{title}</title>
    <path
      fill={fill}
      d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H3v16h16V11h-3zM5 19l3-4 2 3 3-4 4 5H5z"
    />
  </svg>
);

export {
  DownCaretIcon,
  RubbishBinIcon,
  CloseIcon, // block x
  MoreIcon, // tapered +
  ClearIcon, // tapered x
  LockedPadlockIcon,
  MagnifyingGlassIcon,
  AddImageIcon
};
