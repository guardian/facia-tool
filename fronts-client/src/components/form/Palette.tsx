import React from 'react';
import { noop } from 'lodash';

import { ChefPalette, ChefPaletteId } from 'constants/feastPalettes';
import { styled } from 'constants/theme';

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
