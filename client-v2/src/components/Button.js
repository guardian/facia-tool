// @flow

import styled from 'styled-components';

const getColour = ({ selected, dark }) => {
  if (selected) return '#123';
  if (dark) {
    return '#000';
  }
  return '#fff';
};

export default styled(`button`)`
  appearance: none;
  background: ${({ selected }) => (selected ? 'white' : 'transparent')};
  border: 1px solid #fff;
  color: ${getColour};

  :hover {
    background: #fff;
    color: #221133;
    cursor: pointer;
  }

  :focus {
    border: 2px solid #fff;
  }
`;
