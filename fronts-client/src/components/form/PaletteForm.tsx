import React, { useCallback } from 'react';
import { noop } from 'lodash';

import {
  ChefPalette,
  ChefPaletteId,
  CustomPalette,
  chefPalettes,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import { OptionsModalBodyProps } from 'types/Modals';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import { State } from 'types/State';
import InputLabel from 'components/inputs/InputLabel';
import { InputColor } from 'components/inputs/InputColor';
import { ChefCardFormData } from 'util/form';

const PaletteList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const createPaletteForm =
  (formName: string) =>
  ({ onCancel }: OptionsModalBodyProps) => {
    const dispatch = useDispatch();
    const [currentPaletteId, currentForegroundHex, currentBackgroundHex] =
      useSelector((state: State) => {
        const formValues = getFormValues(formName)(state) as ChefCardFormData;
        if (!formValues) {
          return [];
        }

        return [
          formValues['paletteId'],
          formValues['foregroundHex'],
          formValues['backgroundHex'],
        ];
      });
    const setPaletteOption = useCallback(
      (
        paletteName: ChefPaletteId,
        foregroundHex: string,
        backgroundHex: string
      ) => {
        dispatch(change(formName, 'paletteId', paletteName));
        dispatch(change(formName, 'foregroundHex', foregroundHex));
        dispatch(change(formName, 'backgroundHex', backgroundHex));
      },
      [formName]
    );

    return (
      <>
        <PaletteList>
          {Object.entries(chefPalettes).map(([name, palette]) => (
            <PaletteItem
              palette={palette}
              key={name}
              id={name as ChefPaletteId}
              onClick={(name, foregroundHex, backgroundHex) => {
                setPaletteOption(
                  name as ChefPaletteId,
                  foregroundHex,
                  backgroundHex
                );
                onCancel();
              }}
              isSelected={name === currentPaletteId}
            />
          ))}
          <PaletteItem
            id={CustomPalette}
            palette={
              currentPaletteId === CustomPalette
                ? {
                    foregroundHex: currentForegroundHex,
                    backgroundHex: currentBackgroundHex,
                  }
                : undefined
            }
            onClick={(_, foregroundHex, backgroundHex) =>
              setPaletteOption(CustomPalette, foregroundHex, backgroundHex)
            }
            isSelected={currentPaletteId === CustomPalette}
          />
        </PaletteList>
        {currentPaletteId === CustomPalette && (
          <CustomPaletteContainer>
            <h3>Choose a custom palette</h3>
            <div>
              <InputLabel htmlFor="foregroundHex">Foreground colour</InputLabel>
              <InputColor
                type="color"
                value={currentForegroundHex}
                onChange={(e) => {
                  dispatch(change(formName, 'foregroundHex', e.target.value));
                }}
              />
            </div>
            <div>
              <InputLabel htmlFor="backgroundHex">Background colour</InputLabel>
              <InputColor
                type="color"
                value={currentBackgroundHex}
                onChange={(e) => {
                  dispatch(change(formName, 'backgroundHex', e.target.value));
                }}
              />
            </div>
          </CustomPaletteContainer>
        )}
      </>
    );
  };

const CustomPaletteContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PaletteItem = ({
  id,
  palette,
  onClick = noop,
  isSelected = false,
}: {
  id: ChefPaletteId;
  palette?: ChefPalette;
  onClick?: (
    paletteId: ChefPaletteId,
    foregroundHex: string,
    backgroundHex: string
  ) => void;
  isSelected?: boolean;
}) => {
  return (
    <PaletteOption
      key={id}
      onClick={() =>
        onClick(id, palette?.foregroundHex ?? '', palette?.backgroundHex ?? '')
      }
      isSelected={isSelected}
    >
      <PaletteHeading>{id}</PaletteHeading>
      {palette && (
        <PaletteSwatch
          colors={[palette.backgroundHex, palette.foregroundHex]}
        />
      )}
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
