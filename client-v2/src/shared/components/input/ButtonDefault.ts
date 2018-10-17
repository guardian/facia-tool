import styled from 'styled-components';

type ButtonSizes = 's' | 'm' | 'l';
type ButtonPriorities = 'primary' | 'default';

type SizeMap = { [k in ButtonSizes]: string };
type PriorityMap = { [k in ButtonPriorities]: string };

interface ColorMap {
  selected: PriorityMap;
  deselected: PriorityMap;
}

interface ButtonProps {
  selected?: boolean;
  priority?: ButtonPriorities;
  size?: ButtonSizes;
  pill?: boolean;
  dark?: boolean;
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
  selected: {
    default: '#555',
    primary: '#ff983f'
  },
  deselected: {
    default: '#555',
    primary: '#ff983f'
  }
};

const mapSize = (map: SizeMap) => ({ size = 'm' }: ButtonProps) => map[size];
const mapAction = (map: ColorMap) => ({
  selected,
  priority = 'default'
}: ButtonProps) => map[selected ? 'selected' : 'deselected'][priority];

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
