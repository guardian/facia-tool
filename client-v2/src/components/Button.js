// @flow

import styled from 'styled-components';

export default styled(`button`)`
  appearance: none;
  background: ${({ selected }) => (selected ? 'white' : 'transparent')};
  border: 1px solid #fff;
  color: ${({ selected }) => (selected ? '#213' : '#fff')};

  :hover {
    background: #fff;
    color: #221133;
    cursor: pointer;
  }

  :focus {
    border: 2px solid #fff;
  }
`;
