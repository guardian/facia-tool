// @flow

import styled from 'styled-components';

export default styled(`button`)`
  appearance: none;
  background: transparent;
  border: 1px solid #fff;
  color: #fff;

  :hover {
    background: #fff;
    color: #221133;
    cursor: pointer;
  }

  :focus {
    border: 2px solid #fff;
  }
`;
