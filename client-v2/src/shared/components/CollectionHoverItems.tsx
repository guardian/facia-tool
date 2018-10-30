import styled from 'styled-components';

const HoverActionsAreaOverlay = styled('div')<{
  isSnapLink?: boolean;
}>`
  display: flex;
  justify-content: ${({ isSnapLink }) =>
    isSnapLink ? 'flex-end' : 'space-between'};
  padding: 4px 8px;
`;

const HideMetaDataOnToolTipDisplay = styled('div')<{
  size?: string; // Article Component size
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
