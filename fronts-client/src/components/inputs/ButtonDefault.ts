import { styled } from 'constants/theme';
import { theme } from '../../constants/theme';

type ButtonSizes = 's' | 'm' | 'l';
type ButtonPriorities = 'primary' | 'default' | 'muted' | 'transparent';

type SizeMap = { [k in ButtonSizes]: string };
type PriorityMap = { [k in ButtonPriorities]: string };

interface ColorMap {
	selected: PriorityMap;
	deselected: PriorityMap;
	disabled: PriorityMap;
}

interface ButtonProps {
	selected?: boolean;
	priority?: ButtonPriorities;
	size?: ButtonSizes;
	dark?: boolean;
	inline?: boolean;
	disabled?: boolean;
}

const heightMap = {
	s: '20px',
	m: '24px',
	l: '40px',
};

const paddingMap = {
	s: '5px',
	m: '15px',
	l: '15px',
};

const fontSizeMap = {
	s: '12px',
	m: '14px',
	l: '14px',
};

const colorMap = {
	disabled: {
		default: theme.colors.white,
		primary: theme.colors.greyLight,
		muted: theme.colors.blackLight,
		transparent: theme.colors.white,
	},
	selected: {
		default: theme.colors.white,
		primary: theme.colors.white,
		muted: theme.colors.blackLight,
		transparent: theme.colors.white,
	},
	deselected: {
		default: theme.colors.white,
		primary: theme.colors.blackDark,
		muted: theme.colors.blackLight,
		transparent: theme.colors.white,
	},
};

const backgroundMap = {
	disabled: {
		default: theme.colors.greyMediumLight,
		primary: theme.colors.whiteMedium,
		muted: theme.colors.greyLight,
		transparent: theme.colors.blackTransparent20,
	},
	selected: {
		default: theme.colors.greyMediumDark,
		primary: theme.colors.orangeLight,
		muted: theme.colors.greyLight,
		transparent: theme.colors.blackTransparent60,
	},
	deselected: {
		default: theme.colors.blackLight,
		primary: theme.colors.orange,
		muted: theme.colors.greyLightPinkish,
		transparent: theme.colors.blackTransparent40,
	},
};

const backgroundHoverMap = {
	disabled: {
		default: theme.colors.greyMediumLight,
		primary: theme.colors.orangeDark,
		muted: theme.colors.greyLight,
		transparent: theme.colors.blackTransparent20,
	},
	selected: {
		default: theme.colors.greyMediumDark,
		primary: theme.colors.orangeLight,
		muted: theme.colors.greyLight,
		transparent: theme.colors.blackTransparent60,
	},
	deselected: {
		default: theme.colors.greyMediumDark,
		primary: theme.colors.orangeLight,
		muted: theme.colors.greyLight,
		transparent: theme.colors.blackTransparent60,
	},
};

const letterSpacingMap = {
	s: '0px',
	m: '0px',
	l: '0.5px',
};

const getMapKey = ({
	disabled,
	selected,
}: {
	disabled?: boolean | undefined;
	selected?: boolean | undefined;
}) => {
	if (disabled) {
		return 'disabled';
	}
	return selected ? 'selected' : 'deselected';
};

const mapSize =
	(map: SizeMap) =>
	({ size = 'm' }: ButtonProps) =>
		map[size];
const mapAction =
	(map: ColorMap) =>
	({ selected, disabled, priority = 'default' }: ButtonProps) =>
		map[getMapKey({ selected, disabled })][priority];

export default styled.button<ButtonProps>`
	display: inline-block;
	appearance: none;
	background: ${mapAction(backgroundMap)};
	color: ${mapAction(colorMap)};
	font-family: TS3TextSans;
	font-size: ${mapSize(fontSizeMap)};
	font-weight: bold;
	height: ${mapSize(heightMap)};
	letter-spacing: ${mapSize(letterSpacingMap)};
	line-height: 1;
	margin: 0 ${({ inline }) => (inline ? '5px' : '0')};
	padding: 0 ${mapSize(paddingMap)};
	border: none;
	&:disabled,
	&:disabled:hover {
		cursor: not-allowed;
	}
	&:hover:enabled {
		background: ${mapAction(backgroundHoverMap)};
		cursor: pointer;
	}
	&:focus {
		outline: 1px solid ${(props) => props.theme.base.colors.focusColor};
	}

	:not(:first-child) {
		${({ inline }) => inline && 'margin-left: 5px'};
	}
`;
