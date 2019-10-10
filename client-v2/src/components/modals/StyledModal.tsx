import Modal from 'react-modal';
import { styled, theme } from 'constants/theme';
import { StyledModalProps } from '../../types/Modals';

const StyledModal = styled(Modal)`
  position: absolute;
  top: 40px;
  font-size: 14px;
  left: 50%;
  background: ${theme.shared.base.colors.backgroundColorLight};
  overflow: auto;
  outline: none;
  padding: 20px;
  margin-left: -${({ width = 400 }: StyledModalProps) => width / 2}px;
  min-height: 200px;
  width: ${({ width = 400 }: StyledModalProps) => width}px;
`;

const Actions = styled.div`
  border-top: solid 1px ${theme.shared.base.colors.borderColor};
  margin-top: 1.5em;
  padding-top: 1.5em;
  text-align: right;
`;

export { StyledModal, Actions };
