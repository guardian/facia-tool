import { styled } from 'shared/constants/theme';
import { theme } from '../../constants/theme';

type ButtonSizes = 's' | 'm' | 'l';
type ButtonPriorities = 'primary' | 'default' | 'muted';

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
  pill?: boolean;
  dark?: boolean;
  inline?: boolean;
  disabled?: boolean;
}

const heightMap = {
  s: '20px',
  m: '24px',
  l: '40px'
};

const paddingMap = {
  s: '5px',
  m: '15px',
  l: '25px'
};

const fontSizeMap = {
  s: '12px',
  m: '14px',
  l: '14px'
};

const colorMap = {
  disabled: {
    default: theme.colors.white,
    primary: theme.colors.white,
    muted: theme.colors.blackLight
  },
  selected: {
    default: theme.colors.white,
    primary: theme.colors.white,
    muted: theme.colors.blackLight
  },
  deselected: {
    default: theme.colors.white,
    primary: theme.colors.white,
    muted: theme.colors.blackLight
  }
};

const backgroundMap = {
  disabled: {
    default: theme.colors.greyMedium,
    primary: theme.colors.orangeDark,
    muted: theme.colors.greyLight
  },
  selected: {
    default: theme.colors.greyDark,
    primary: theme.colors.orangeLight,
    muted: theme.colors.greyLight
  },
  deselected: {
    default: theme.colors.blackLight,
    primary: theme.colors.orange,
    muted: theme.colors.greyLightPinkish
  }
};

const backgroundHoverMap = {
  disabled: {
    default: theme.colors.greyMedium,
    primary: theme.colors.orangeDark,
    muted: theme.colors.greyLight
  },
  selected: {
    default: theme.colors.greyDark,
    primary: theme.colors.orangeLight,
    muted: theme.colors.greyLight
  },
  deselected: {
    default: theme.colors.greyDark,
    primary: theme.colors.orangeLight,
    muted: theme.colors.greyLight
  }
};

const getMapKey = ({
  disabled,
  selected
}: {
  disabled?: boolean | undefined;
  selected?: boolean | undefined;
}) => {
  if (disabled) {
    return 'disabled';
  }
  return selected ? 'selected' : 'deselected';
};

const mapSize = (map: SizeMap) => ({ size = 'm' }: ButtonProps) => map[size];
const mapAction = (map: ColorMap) => ({
  selected,
  disabled,
  priority = 'default'
}: ButtonProps) => map[getMapKey({ selected, disabled })][priority];

export default styled(`button`)`
  display: inline-block;
  appearance: none;
  background: ${mapAction(backgroundMap)};
  border-radius: ${({ pill }) => (pill ? '0.5em' : '0')};
  color: ${mapAction(colorMap)};
  font-family: TS3TextSans;
  font-size: ${mapSize(fontSizeMap)};
  font-weight: bold;
  height: ${mapSize(heightMap)};
  line-height: 1;
  margin: 0 ${({ inline }) => (inline ? '5px' : '0')};
  padding: 0 ${mapSize(paddingMap)};
  border: none;
  :disabled,
  :disabled:hover {
    cursor: not-allowed;
  }
  :hover {
    background: ${mapAction(backgroundHoverMap)};
    cursor: pointer;
  }
  &:focus {
    outline: transparent;
  }

  :not(:first-child) {
    margin-left: ${({ inline }) => (inline ? '5px' : '0')};
  }
`;
