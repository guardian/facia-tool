import React, { useCallback } from 'react';
import { noop } from 'lodash';

import {
  ChefPalette,
  ChefPaletteId,
  chefPalettes,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import { OptionsModalBodyProps } from 'types/Modals';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import { State } from 'types/State';

const PaletteList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const createPaletteForm =
  (formName: string) =>
  ({ onCancel }: OptionsModalBodyProps) => {
    const dispatch = useDispatch();
    const currentPaletteId = useSelector((state: State) => {
      const formValues = getFormValues(formName)(state) as {
        paletteId: string;
      };
      return formValues['paletteId'];
    });
    const setPaletteOption = useCallback(
      (paletteName: keyof typeof chefPalettes) => {
        dispatch(change(formName, 'paletteId', paletteName));
        dispatch(
          change(
            formName,
            'foregroundHex',
            chefPalettes[paletteName].foregroundHex
          )
        );
        dispatch(
          change(
            formName,
            'backgroundHex',
            chefPalettes[paletteName].backgroundHex
          )
        );

        onCancel();
      },
      [formName]
    );

    return (
      <PaletteList>
        {Object.entries(chefPalettes).map(([name, palette]) => (
          <PaletteItem
            palette={palette}
            key={name}
            id={name as ChefPaletteId}
            onClick={(name) => setPaletteOption(name as ChefPaletteId)}
            isSelected={name === currentPaletteId}
          />
        ))}
      </PaletteList>
    );
  };

export const PaletteItem = ({
  id,
  palette,
  onClick = noop,
  isSelected = false,
}: {
  id: ChefPaletteId;
  palette: ChefPalette;
  onClick?: (paletteId: ChefPaletteId) => void;
  isSelected?: boolean;
}) => {
  return (
    <PaletteOption key={id} onClick={() => onClick(id)} isSelected={isSelected}>
      <PaletteHeading>{id}</PaletteHeading>
      <PaletteSwatch colors={[palette.backgroundHex, palette.foregroundHex]} />
    </PaletteOption>
  );
};

const PaletteHeading = styled.h3`
  margin-top: 0;
`;

const PaletteOption = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  width: min-content;
  padding: 10px;
  margin: 5px 5px 5px 0;
  border: 2px solid ${({ isSelected }) => (isSelected ? 'darkblue' : '#ccc')};
  border-radius: 5px;
  cursor: pointer;
`;

const PaletteSwatch = ({ colors }: { colors: string[] }) => (
  <PaletteContainer borderColor={colors[0]}>
    {colors.map((color) => (
      <PaletteColor key={color} color={color} />
    ))}
  </PaletteContainer>
);

const PaletteContainer = styled.div<{ borderColor: string | undefined }>`
  display: flex;
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: ${({ borderColor }) =>
    borderColor ? `2px solid ${borderColor}` : 'none'};
  overflow: hidden;
`;

const PaletteColor = styled.div<{ color: string }>`
  flex-grow: 1;
  background-color: ${({ color }) => color};
  height: 100%;
  min-width: 10px;
`;
