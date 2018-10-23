import styled from 'styled-components';

const HoverActions = styled('div')`
  display: flex;
  justify-content: space-between;
  align-content: flex-end;
  padding: 0 10px 8px;
  bottom: 0;
  left: 0;
  opacity: 1;
  position: absolute;
  right: 0;
  visibility: hidden;
`;

const HoverActionsLeft = styled('div')`
  display: flex;
  justify-content: space-around;
`;

const HoverActionsRight = styled('div')`
  display: flex;
  justify-content: space-around;
`;

export { HoverActionsLeft, HoverActionsRight }

export default HoverActions;
