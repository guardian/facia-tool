import React, { useCallback } from 'react';
import noop from 'lodash/noop';
import get from 'lodash/get';
import {
  ChefPaletteId,
  CustomPalette,
  chefPalettes,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import { State } from 'types/State';
import InputLabel from 'components/inputs/InputLabel';
import { InputColor } from 'components/inputs/InputColor';
import { Palette } from 'types/Collection';

export const createPaletteForm =
  <T extends string>(
    formName: string,
    // The name of the field to set. Can be in dot accessor notation, e.g.
    // `nested.field.property`.
    fieldName: T,
    onPaletteSelect: () => void = noop
  ) =>
  () => {
    const dispatch = useDispatch();
    const formPalette = useSelector((state: State) => {
      const formValues = getFormValues(formName)(state) as {
        [T: string]: Palette;
      };
      if (!formValues) {
        return undefined;
      }

      return get(formValues, fieldName);
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
          {Object.values(chefPalettes).map((palette) => (
            <PaletteItem
              palette={palette}
              key={palette.paletteId}
              onClick={(name, foregroundHex, backgroundHex) => {
                setPaletteOption(name, foregroundHex, backgroundHex);
                onPaletteSelect();
              }}
              isSelected={
                formPalette?.paletteId &&
                palette.paletteId === formPalette?.paletteId
              }
            />
          ))}
          <PaletteItem
            palette={{
              foregroundHex:
                formPalette?.paletteId === CustomPalette
                  ? formPalette?.foregroundHex
                  : '',
              backgroundHex:
                formPalette?.paletteId === CustomPalette
                  ? formPalette?.backgroundHex
                  : '',
              paletteId: CustomPalette,
            }}
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

type PaletteSize = 'm' | 's';

export const PaletteItem = ({
  palette,
  onClick = noop,
  isSelected = false,
  size = 'm',
}: {
  palette: Palette;
  onClick?: (
    paletteId: ChefPaletteId,
    foregroundHex: string,
    backgroundHex: string
  ) => void;
  isSelected?: boolean;
  size?: 'm' | 's';
}) => {
  const swatch = (
    <PaletteSwatch
      size={size}
      colors={[palette.backgroundHex, palette.foregroundHex]}
    />
  );

  if (size === 's') {
    return swatch;
  }

  return (
    <PaletteOption
      onClick={() =>
        onClick(
          palette.paletteId,
          palette.foregroundHex ?? '',
          palette.backgroundHex ?? ''
        )
      }
      isSelected={isSelected}
    >
      <PaletteHeading>{palette.paletteId}</PaletteHeading>
      {swatch}
    </PaletteOption>
  );
};

const PaletteSwatch = ({
  colors,
  size,
}: {
  colors: string[];
  size: PaletteSize;
}) => (
  <PaletteContainer borderColor={colors[0]} size={size}>
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

const PaletteContainer = styled.div<{
  borderColor: string | undefined;
  size: PaletteSize;
}>`
  display: flex;
  width: ${({ size }) => (size === 'm' ? '50px' : '40px')};
  height: ${({ size }) => (size === 'm' ? '50px' : '40px')};
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
