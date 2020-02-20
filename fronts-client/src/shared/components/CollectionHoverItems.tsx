import { styled } from 'constants/theme-shared';

const HoverActionsAreaOverlay = styled.div<{
  justify?: 'space-between' | 'flex-end';
  disabled?: boolean;
}>`
  display: ${({ disabled }) => (disabled ? 'none' : 'flex')};
  justify-content: ${({ justify }) => justify};
`;

HoverActionsAreaOverlay.defaultProps = {
  justify: 'space-between'
};

export { HoverActionsAreaOverlay };
