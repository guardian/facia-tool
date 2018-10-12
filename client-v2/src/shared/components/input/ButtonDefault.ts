

import styled from 'styled-components';

const getColour = ({ selected, dark }) => {
  if (selected) return '#123';
  if (dark) {
    return '#000';
  }
  return '#fff';
};

export default styled(`button`)`
  display: inline-block;
  appearance: none;
  background: ${({ selected }) => (selected ? '#555555' : '#333333')};
  color: ${getColour};
  height: 40px;
  font-family: TS3TextSans;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  padding: 0 25px;
  border: none;
  :hover {
    background: #555555;
    cursor: pointer;
  }
  &:focus {
    outline: transparent;
  }
  & + & {
    margin-left: 1px;
  }
`;
