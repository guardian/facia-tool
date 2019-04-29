import { styled } from 'shared/constants/theme';

const HoverActionsAreaOverlay = styled('div')<{
  justify?: 'space-between' | 'flex-end';
  disabled?: boolean;
}>`
  display: ${({ disabled }) => (disabled ? 'none' : 'flex')};
  justify-content: ${({ justify }) => justify};
  padding: 4px 8px;
  /* We zero the height here to ensure the container doesn't */
  /* interfere with clicks, as it overlays the collection item */
  height: 0;
`;

HoverActionsAreaOverlay.defaultProps = {
  justify: 'space-between'
};

const HideMetaDataOnToolTipDisplay = styled('div')<{
  size?: 'small' | 'default'; // Article Component size
}>`
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorFocused};
  position: absolute;
  width: 70px;
  height: ${({ size }) => (size === 'small' ? '90%' : '180%')};
  margin: 2px;
  bottom: 0;
  left: 0;
  right: 0;
`;

export { HoverActionsAreaOverlay, HideMetaDataOnToolTipDisplay };
