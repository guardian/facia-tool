import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import deleteIcon from 'shared/images/icons/delete-copy.svg';

interface ModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onMessage: (message: any) => void;
}

const StyledModal = styled(Modal)`
  position: absolute;
  font-size: 14px;
  overflow: auto;
  outline: none;
  padding: 20px;
  min-height: 200px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
`;

const ModalButton = styled(ButtonDefault)`
  position: absolute;
  right: 17px;
  top: 15px;
  border-radius: 50%
  height: 27px;
  width: 27px;
`;

const GridIFrame = styled('iframe')`
  height: 100%;
  width: 96%;
  margin-left: 2%;
  border: 0;
`;

const ImageContainer = styled('img')`
  position: absolute;
  top: 10px;
  left: 10px;
`;

export const GridModal = ({ isOpen, url, onMessage, onClose }: ModalProps) => (
  <React.Fragment>
    <StyledModal isOpen={isOpen}>
      <ModalButton type="button" priority="primary" onClick={onClose}>
        <ImageContainer src={deleteIcon} />
      </ModalButton>

      <GridIFrame src={url} />
    </StyledModal>
  </React.Fragment>
);
