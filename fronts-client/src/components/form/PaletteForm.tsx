import React, { useCallback } from 'react';
import noop from 'lodash/noop';

import {
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
import { Palette } from 'types/Collection';
import { entries } from 'util/object';

export const createPaletteForm =
  <T extends string>(formName: string, fieldName: T) =>
  ({ onCancel }: OptionsModalBodyProps) => {
    const dispatch = useDispatch();
    const formPalette = useSelector((state: State) => {
      const formValues = getFormValues(formName)(state) as {
        [T: string]: Palette;
      };
      if (!formValues) {
        return undefined;
      }

      return formValues[fieldName] as Palette;
    });
    const setPaletteOption = useCallback(
      (
        paletteName: ChefPaletteId,
        foregroundHex: string,
        backgroundHex: string
      ) => {
        dispatch(change(formName, `${fieldName}.paletteId`, paletteName));
        dispatch(change(formName, `${fieldName}.foregroundHex`, foregroundHex));
        dispatch(change(formName, `${fieldName}.backgroundHex`, backgroundHex));
      },
      [formName]
    );

    return (
      <>
        <PaletteList>
          {entries(chefPalettes).map(([paletteId, palette]) => (
            <PaletteItem
              palette={palette}
              key={paletteId}
              id={paletteId}
              onClick={(name, foregroundHex, backgroundHex) => {
                setPaletteOption(name, foregroundHex, backgroundHex);
                onCancel();
              }}
              isSelected={
                formPalette?.paletteId && paletteId === formPalette?.paletteId
              }
            />
          ))}
          <PaletteItem
            id={CustomPalette}
            palette={
              formPalette?.paletteId === CustomPalette
                ? {
                    foregroundHex: formPalette?.foregroundHex,
                    backgroundHex: formPalette?.backgroundHex,
                  }
                : undefined
            }
            onClick={(_, foregroundHex, backgroundHex) =>
              setPaletteOption(CustomPalette, foregroundHex, backgroundHex)
            }
            isSelected={formPalette?.paletteId === CustomPalette}
          />
        </PaletteList>
        {formPalette?.paletteId === CustomPalette && (
          <CustomPaletteContainer>
            <h3>Choose a custom palette</h3>
            <div>
              <InputLabel htmlFor="foregroundHex">Foreground colour</InputLabel>
              <InputColor
                type="color"
                value={formPalette?.foregroundHex}
                onChange={(e) => {
                  dispatch(
                    change(
                      formName,
                      `${fieldName}.foregroundHex`,
                      e.target.value
                    )
                  );
                }}
              />
            </div>
            <div>
              <InputLabel htmlFor="backgroundHex">Background colour</InputLabel>
              <InputColor
                type="color"
                value={formPalette?.backgroundHex}
                onChange={(e) => {
                  dispatch(
                    change(
                      formName,
                      `${fieldName}.backgroundHex`,
                      e.target.value
                    )
                  );
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
  palette?: Omit<Palette, 'paletteId'>;
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
          key={id}
          colors={[palette.backgroundHex, palette.foregroundHex]}
        />
      )}
    </PaletteOption>
  );
};

const PaletteSwatch = ({ colors }: { colors: string[] }) => (
  <PaletteContainer borderColor={colors[0]}>
    {colors.map((color, index) => (
      <PaletteColor key={`${color}-${index}`} color={color} />
    ))}
  </PaletteContainer>
);

const PaletteList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

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
