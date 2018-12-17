import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import ButtonDefault from 'shared/components/input/ButtonDefault';

interface ModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void,
  onMessage: (message: any) => void
}

const StyledModal = styled(Modal)`
  position: absolute;
  font-size: 14px;
  background: rgb(255, 255, 255);
  overflow: auto;
  outline: none;
  padding: 20px;
  min-height: 200px;
  width: calc(100% - 60px);
  height: calc(100% - 60px);
`;

const GridIFrame = styled('iframe')`
  height: 100%;
  width: 100%;
`;

export const GridModal = ({
  isOpen,
  url,
  onMessage,
  onClose
}: ModalProps) => console.log({isOpen}) ||
  <React.Fragment>
    { isOpen && <ButtonDefault onClick={onClose}>Close</ButtonDefault> }
    <StyledModal
      isOpen={isOpen}
    >
      <GridIFrame src={url}/>
    </StyledModal>
  </React.Fragment>
