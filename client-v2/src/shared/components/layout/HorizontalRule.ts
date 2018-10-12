

import styled from 'styled-components';

export default styled('div')`
  width: 100%;
  height: 1px;
  border-top: solid 1px #c4c4c4;
  margin: ${props => (props.noMargin ? '0' : '6px')} 0;
`;
