

import styled from 'styled-components';

export default styled('div')`
  background-color: #f6f6f6;
  position: relative;
  padding: 0 10px 10px 10px;
  box-shadow: 0 -1px 0 #333;
  border: 1px solid #c9c9c9;
  border-top: none;
  & + & {
    margin-top: 10px;
  }
`;
