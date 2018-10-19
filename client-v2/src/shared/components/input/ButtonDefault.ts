import styled from 'styled-components';

type ButtonSizes = 's' | 'm' | 'l';
type ButtonPriorities = 'primary' | 'default';

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
    default: '#fff',
    primary: '#fff'
  },
  selected: {
    default: '#fff',
    primary: '#fff'
  },
  deselected: {
    default: '#fff',
    primary: '#fff'
  }
};

const backgroundMap = {
  disabled: {
    default: '#999',
    primary: '#fda354'
  },
  selected: {
    default: '#555',
    primary: '#ff983f'
  },
  deselected: {
    default: '#333',
    primary: '#ff7f0f'
  }
};

const backgroundHoverMap = {
  disabled: {
    default: '#999',
    primary: '#fda354'
  },
  selected: {
    default: '#555',
    primary: '#ff983f'
  },
  deselected: {
    default: '#555',
    primary: '#ff983f'
  }
};

const getMapKey = ({
  disabled,
  selected
}: {
  disabled?: boolean|undefined;
  selected?: boolean|undefined;
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
  padding: 0 ${mapSize(paddingMap)};
  border: none;
  :disabled, :disabled:hover {
    cursor: not-allowed;
  }
  :hover {
    background: ${mapAction(backgroundHoverMap)};
    cursor: pointer;
  }
  &:focus {
    outline: transparent;
  }
  & + & {
    margin-left: 1px;
  }
`;
