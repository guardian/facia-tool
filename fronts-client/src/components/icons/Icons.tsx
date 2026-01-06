import React from 'react';
import { theme } from 'constants/theme';

interface IconProps {
	fill?: string;
	size?: IconSizes;
	title?: string | null;
}

interface Directions {
	direction?: 'up' | 'down';
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
	fill: '100%',
};
const mapSize = (size: IconSizes): number | string => IconSizeMap[size];

const DownCaretIcon = ({
	fill,
	size = 'm',
	title = null,
	direction = 'down',
}: IconProps & Directions) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		transform={direction === 'down' ? undefined : 'rotate(180)'}
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

const RewindIcon = ({ fill = '#333', size = 'xxs' }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		width={mapSize(size)}
		height={mapSize(size)}
		fill={fill}
		viewBox="0 0 330.002 330.002"
		xmlSpace="preserve"
	>
		<path
			d="M320.741,1.143c-5.602-2.322-12.057-1.039-16.347,3.251L180.001,128.787V15.001
	c0-6.067-3.654-11.537-9.26-13.858c-5.605-2.324-12.059-1.039-16.347,3.251l-150,149.999c-2.813,2.813-4.394,6.628-4.394,10.606
	c0,3.978,1.58,7.794,4.394,10.607l150,150.001c2.87,2.87,6.706,4.394,10.61,4.394c1.932,0,3.881-0.374,5.736-1.142
	c5.605-2.322,9.26-7.792,9.26-13.858V201.213l124.394,124.394c2.869,2.87,6.706,4.394,10.609,4.394c1.933,0,3.882-0.374,5.737-1.142
	c5.605-2.322,9.26-7.792,9.26-13.858v-300C330.001,8.934,326.347,3.465,320.741,1.143z"
		/>
	</svg>
);

const StarIcon = ({
	fill = theme.colors.white,
	outline = theme.colors.white,
	size = 'm',
	title = null,
}: IconProps & { outline?: string }) => (
	<svg
		className="star-icon"
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>{title}</title>
		<path
			className="fill"
			fill={fill}
			d="M12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28z"
		/>
		<path
			className="outline"
			fill={outline}
			d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
		/>
	</svg>
);

const RubbishBinIcon = ({
	fill = theme.colors.white,
	size = 'm',
	title = null,
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

const ConfirmDeleteIcon = ({
	fill = theme.colors.white,
	size = 'm',
	title = null,
}: IconProps) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 14 18"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>{title}</title>
		<path
			fill={fill}
			d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM3.46 8.88L4.87 7.47L7 9.59L9.12 7.47L10.53 8.88L8.41 11L10.53 13.12L9.12 14.53L7 12.41L4.88 14.53L3.47 13.12L5.59 11L3.46 8.88ZM10.5 1L9.5 0H4.5L3.5 1H0V3H14V1H10.5Z"
		/>
	</svg>
);

const MagnifyingGlassIcon = ({
	fill = theme.colors.white,
	size = 'm',
	title = 'Search',
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
	title = null,
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
			fillRule="evenodd"
			d="M6.485 4.571L9.314 7.4 7.899 8.814 5.071 5.985 2.243 8.814.828 7.399l2.829-2.828L.828 1.743 2.243.328 5.07 3.157 7.9.328l1.415 1.415L6.485 4.57z"
		/>
	</svg>
);

// tapered x
const ClearIcon = ({
	fill = theme.colors.white,
	size = 'm',
	title = null,
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
	title = null,
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
	title = 'Locked',
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
	title = 'Add mage',
}: IconProps) => (
	<svg width={mapSize(size)} height={mapSize(size)} viewBox="0 0 22 22">
		<title>{title}</title>
		<path
			fill={fill}
			d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H3v16h16V11h-3zM5 19l3-4 2 3 3-4 4 5H5z"
		/>
	</svg>
);

const PreviewEyeIcon = ({
	fill = theme.colors.white,
	size = 'm',
	title = null,
}: IconProps) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="-1 -7 30 30"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>{title}</title>
		<path
			fill={fill}
			d="M14,0 C20.2045455,0 28,8.24090909 28,8.24090909 L28,9.73636364 C28,9.73636364 20.2045455,17.9772727 14,17.9772727 C7.79545455,17.9772727 0,9.73636364 0,9.73636364 L0,8.24090909 C0,8.24090909 7.79545455,0 14,0 Z M14,14.9863636 C17.3090909,14.9863636 20.0136364,12.3136364 20.0136364,9.00454545 C20.0136364,5.66363636 17.3090909,2.99090909 14,2.99090909 C10.6909091,2.99090909 7.98636364,5.66363636 7.98636364,9.00454545 C7.98636364,12.3136364 10.6909091,14.9863636 14,14.9863636 Z M14,7 C14,8.08181818 14.8909091,9.00454545 16.0045455,9.00454545 L16.9909091,9.00454545 C16.9909091,10.6590909 15.6545455,11.9954545 14,11.9954545 C12.3454545,11.9954545 11.0090909,10.6590909 11.0090909,9.00454545 C11.0090909,7.31818182 12.3454545,5.98181818 14,5.98181818 L14,7 Z"
		/>
	</svg>
);

const GuardianRoundel = ({ size = 'm' }: IconProps) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 42 42"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M21.0001 0C9.4022 0 0 9.40185 0 21C0 32.598 9.4022 42 21.0001 42C32.5981 42 42 32.598 42 21C42 9.40185 32.5981 0 21.0001 0Z"
			fill="white"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M33.6975 22.1508L31.5419 23.1144V33.054C30.3294 34.209 27.2308 36.0091 24.2669 36.6278V35.9057V34.5506V22.8978L21.9766 22.0886V21.4883H33.6975V22.1508ZM22.9534 5.59522C22.9534 5.59522 22.9091 5.59481 22.8873 5.59481C18.0281 5.59481 15.2482 12.1467 15.3883 20.9844C15.2482 29.8541 18.0281 36.4059 22.8873 36.4059C22.9091 36.4059 22.9534 36.4056 22.9534 36.4056V37.0865C15.6684 37.5736 5.72172 32.1464 5.86182 21.0163C5.72172 9.85427 15.6684 4.42706 22.9534 4.91415V5.59522ZM24.4182 4.88354C27.2671 5.31864 30.5229 7.18965 31.7438 8.51795V14.651H31.0423L24.4182 5.56037V4.88354Z"
			fill="black"
		/>
	</svg>
);

const YoutubeIcon = ({ fill = '#333', size = 'm' }: IconProps) => (
	<svg
		fill={fill}
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 32 32"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M12.932 20.459v-8.917l7.839 4.459zM30.368 8.735c-0.354-1.301-1.354-2.307-2.625-2.663l-0.027-0.006c-3.193-0.406-6.886-0.638-10.634-0.638-0.381 0-0.761 0.002-1.14 0.007l0.058-0.001c-0.322-0.004-0.701-0.007-1.082-0.007-3.748 0-7.443 0.232-11.070 0.681l0.434-0.044c-1.297 0.363-2.297 1.368-2.644 2.643l-0.006 0.026c-0.4 2.109-0.628 4.536-0.628 7.016 0 0.088 0 0.176 0.001 0.263l-0-0.014c-0 0.074-0.001 0.162-0.001 0.25 0 2.48 0.229 4.906 0.666 7.259l-0.038-0.244c0.354 1.301 1.354 2.307 2.625 2.663l0.027 0.006c3.193 0.406 6.886 0.638 10.634 0.638 0.38 0 0.76-0.002 1.14-0.007l-0.058 0.001c0.322 0.004 0.702 0.007 1.082 0.007 3.749 0 7.443-0.232 11.070-0.681l-0.434 0.044c1.298-0.362 2.298-1.368 2.646-2.643l0.006-0.026c0.399-2.109 0.627-4.536 0.627-7.015 0-0.088-0-0.176-0.001-0.263l0 0.013c0-0.074 0.001-0.162 0.001-0.25 0-2.48-0.229-4.906-0.666-7.259l0.038 0.244z"></path>
	</svg>
);

const VideoIcon = ({ fill = '#333' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		width="13"
		height="10"
		viewBox="0 0 13 9"
	>
		<defs>
			<path
				id="a"
				d="M1.2 0L0 1.2v6l1.2 1.2h6.9V0H1.2zM12 .5l-3 3v1.8l3 3h.9V.5H12z"
			/>
		</defs>
		<use fill={fill} fillRule="evenodd" xlinkHref="#a" />
	</svg>
);

const SlideshowIcon = ({}) => (
	<svg
		width="18"
		height="16"
		viewBox="0 0 20 18"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect
			x="6.5"
			y="0.5"
			width="13"
			height="11"
			fill="white"
			stroke="#898983"
		/>
		<rect
			x="3.5"
			y="3.5"
			width="13"
			height="11"
			fill="white"
			stroke="#898983"
		/>
		<rect
			x="0.5"
			y="6.5"
			width="13"
			height="11"
			fill="white"
			stroke="#898983"
		/>
	</svg>
);

const SelectVideoIcon = () => (
	<svg
		width="14"
		height="12"
		viewBox="0 0 14 12"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect
			x="0.5"
			y="0.5"
			width="13"
			height="11"
			fill="white"
			stroke="#898983"
		/>
		<path d="M5 9V6V3L9.5 6L5 9Z" fill="#898983" stroke="#898983" />
	</svg>
);

const DragHandleIcon = ({ fill = theme.colors.greyDark }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="13"
		height="10"
		viewBox="0 0 20 20"
	>
		<path
			fill={fill}
			d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14m6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6m0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14"
		/>
	</svg>
);

const WarningIcon = ({ fill = theme.colors.white, size = 'm' }: IconProps) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 12 9"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5.70536 0L0.5 8.52857L0.833929 9H11.1661L11.5 8.52857L6.29464 0H5.70536ZM5.67346 6.08888H6.32656L6.63705 2.63068L6.20879 2.26666H5.79124L5.36298 2.63068L5.67346 6.08888ZM6.00001 6.72593C6.35038 6.72593 6.63705 7.0126 6.63705 7.36297C6.63705 7.71334 6.35038 8 6.00001 8C5.64964 8 5.36298 7.71334 5.36298 7.36297C5.36298 7.0126 5.64964 6.72593 6.00001 6.72593Z"
			fill={fill}
		/>
	</svg>
);

const CropIcon = ({
	fill = theme.colors.greyDark,
	size = 'xl',
	title = null,
}: IconProps) => (
	<svg
		width={mapSize(size)}
		height={mapSize(size)}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>{title}</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2z"
			fill={fill}
		/>
	</svg>
);

const ReplaceVideoIcon = ({ fill = theme.colors.white }) => (
	<svg
		width="22"
		height="21"
		viewBox="0 0 18 17"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M18 2.47267H15.5008V0H13.9055V2.47267H11.4062V4.01477H13.9055V6.59379H15.5008V4.01477H18V2.47267Z"
			fill={fill}
		/>
		<path
			d="M12.9217 8.42835V5.92909H10.4224V3.45642H0V16.2884H15.421V8.42835H12.9217ZM3.6 6.38838L11.7 9.98838L3.6 13.5884V6.38838Z"
			fill={fill}
		/>
	</svg>
);

const PreviewVideoIcon = ({ fill = theme.colors.white }) => (
	<svg
		width="20"
		height="18"
		viewBox="0 0 16 14"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M15.421 0.456543H0V13.2885H15.421V0.456543ZM3.6 3.3885L11.7 6.9885L3.6 10.5885V3.3885Z"
			fill={fill}
		/>
	</svg>
);

const InfoIcon = ({ fill = theme.colors.white, size = 'm' }: IconProps) => (
	<svg
		width={`${mapSize(size)}px`}
		height={`${mapSize(size)}px`}
		viewBox="0 0 416.979 416.979"
		fill={fill}
	>
		<g
			id="SVGRepo_tracerCarrier"
			strokeLinecap="round"
			strokeLinejoin="round"
		></g>
		<g>
			<g>
				<path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85 c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786 c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576 c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765 c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"></path>
			</g>
		</g>
	</svg>
);

const LoopIcon = ({ fill = theme.colors.white, size = 'm' }: IconProps) => (
	<svg
		width={`${mapSize(size)}px`}
		height={`${mapSize(size)}px`}
		viewBox="0 0 22 22"
		fill="none"
	>
		<circle cx="11" cy="11" r="11" fill={fill} />
		<path
			d="M5.4 17.0408V18.2C5.4 18.4122 5.31571 18.6157 5.16569 18.7657C5.01566 18.9157 4.81217 19 4.6 19C4.38783 19 4.18434 18.9157 4.03431 18.7657C3.88429 18.6157 3.8 18.4122 3.8 18.2V15C3.8 14.7878 3.88429 14.5843 4.03431 14.4343C4.18434 14.2843 4.38783 14.2 4.6 14.2H7.8C8.01217 14.2 8.21566 14.2843 8.36569 14.4343C8.51571 14.5843 8.6 14.7878 8.6 15C8.6 15.2122 8.51571 15.4157 8.36569 15.5657C8.21566 15.7157 8.01217 15.8 7.8 15.8H6.4096C7.6336 16.7888 9.3224 17.4 11 17.4C12.6974 17.4 14.3253 16.7257 15.5255 15.5255C16.7257 14.3253 17.4 12.6974 17.4 11C17.4 10.7878 17.4843 10.5843 17.6343 10.4343C17.7843 10.2843 17.9878 10.2 18.2 10.2C18.4122 10.2 18.6157 10.2843 18.7657 10.4343C18.9157 10.5843 19 10.7878 19 11C19 15.4184 15.4184 19 11 19C8.9608 19 6.9144 18.2672 5.4 17.0408ZM15.5904 6.2C14.3664 5.2112 12.6776 4.6 11 4.6C9.30261 4.6 7.67475 5.27428 6.47452 6.47452C5.27428 7.67475 4.6 9.30261 4.6 11C4.6 11.2122 4.51571 11.4157 4.36569 11.5657C4.21566 11.7157 4.01217 11.8 3.8 11.8C3.58783 11.8 3.38434 11.7157 3.23431 11.5657C3.08429 11.4157 3 11.2122 3 11C3 6.5816 6.5816 3 11 3C13.0392 3 15.0856 3.7328 16.6 4.9592V3.8C16.6 3.58783 16.6843 3.38434 16.8343 3.23431C16.9843 3.08429 17.1878 3 17.4 3C17.6122 3 17.8157 3.08429 17.9657 3.23431C18.1157 3.38434 18.2 3.58783 18.2 3.8V7C18.2 7.21217 18.1157 7.41566 17.9657 7.56569C17.8157 7.71571 17.6122 7.8 17.4 7.8H14.2C13.9878 7.8 13.7843 7.71571 13.6343 7.56569C13.4843 7.41566 13.4 7.21217 13.4 7C13.4 6.78783 13.4843 6.58434 13.6343 6.43431C13.7843 6.28429 13.9878 6.2 14.2 6.2H15.5904Z"
			fill="#1A1A1A"
		/>
		<path d="M9 14V8L15 11L9 14Z" fill="#1A1A1A" />
	</svg>
);

export {
	DownCaretIcon,
	RubbishBinIcon,
	ConfirmDeleteIcon,
	RewindIcon,
	CloseIcon, // block x
	MoreIcon, // tapered +
	ClearIcon, // tapered x
	LockedPadlockIcon,
	MagnifyingGlassIcon,
	AddImageIcon,
	StarIcon,
	PreviewEyeIcon,
	GuardianRoundel,
	VideoIcon,
	SelectVideoIcon,
	SlideshowIcon,
	DragHandleIcon as DragIcon,
	WarningIcon,
	CropIcon,
	ReplaceVideoIcon,
	PreviewVideoIcon,
	InfoIcon,
	LoopIcon,
	YoutubeIcon,
};
