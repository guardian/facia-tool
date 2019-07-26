import React, { useState } from 'react';
import { DownCaretIcon } from '../icons/Icons';
import { styled } from 'shared/constants/theme';
import InputLabel from '../input/InputLabel';

interface Props {
  label: string;
}

const HideableFormSectionContainer = styled.div``;

const FormSectionHeader = styled.div`
  padding-top: 6px;
  margin-bottom: 6px;
  cursor: pointer;
`;

const CaretContainer = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  margin-left: 5px;
  vertical-align: middle;
  transition: transform 0.15s;
  ${({ isOpen }) =>
    isOpen ? `transform: rotate(0deg)` : `transform: rotate(-90deg)`};
`;

const HideableFormSection: React.SFC<Props> = ({ children, label }) => {
  const [isOpen, setOpenState] = useState(false);
  const id = `HideableFormSection-${label}`;
  return (
    <HideableFormSectionContainer>
      <FormSectionHeader onClick={() => setOpenState(!isOpen)}>
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <CaretContainer id={id} isOpen={isOpen}>
          <DownCaretIcon />
        </CaretContainer>
      </FormSectionHeader>
      {isOpen ? children : null}
    </HideableFormSectionContainer>
  );
};

export default HideableFormSection;
