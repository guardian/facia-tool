import styled from 'styled-components';

const HoverActionsAreaOverlay = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
`;

const HideMetaDataOnToolTipDisplay = styled('div')<{
  size?: 'small' | 'default'; // Article Component size
}>`
  background-color: #ededed;
  position: absolute;
  width: 70px;
  height: ${({ size }) => (size === 'small' ? '90%' : '180%')};
  margin: 2px;
  bottom: 0;
  left: 0;
  right: 0;
`;

export { HoverActionsAreaOverlay, HideMetaDataOnToolTipDisplay };
