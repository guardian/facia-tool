import styled from 'styled-components';

const getColour = ({
  selected,
  dark
}: {
  selected?: boolean;
  dark?: boolean;
}) => {
  if (selected) return '#123';
  if (dark) {
    return '#000';
  }
  return '#fff';
};

export default styled(`button`)`
  outline: transparent;
  appearance: none;
  background: ${({ selected }) => (selected ? '#555555' : '#333333')};
  color: ${getColour};
  height: 24px;
  width: 24px;
  font-family: TS3TextSans;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  border: none;
  border-radius: 24px;
  :hover {
    background: #555555;
    cursor: pointer;
  }
  &:hover,
  &:active {
    outline: transparent;
  }
`;
