import React from 'react';
import noop from 'lodash/noop';
import {
  CustomPaletteId,
  PaletteFacet,
  PaletteOption,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import InputLabel from 'components/inputs/InputLabel';
import { InputColor } from 'components/inputs/InputColor';
import { set } from 'lodash/fp';

export const PaletteForm = ({
  currentPaletteOption,
  defaultCustomPaletteOption,
  paletteOptions,
  onChange,
}: {
  currentPaletteOption: PaletteOption | undefined;
  defaultCustomPaletteOption: PaletteOption;
  paletteOptions: PaletteOption[];
  onChange: (paletteOption: PaletteOption) => void;
}) => {
  // const currentPaletteOption = useSelector((state: State) => {
  //   const formValues = getFormValues(formName)(state) as {
  //     [T: string]: PaletteOption;
  //   };
  //   if (!formValues) {
  //     return undefined;
  //   }

  //   return get(formValues, fieldName);
  // });

  // const setPaletteOption = useCallback(
  //   (paletteName: string, foregroundHex: string, backgroundHex: string) => {
  //     dispatch(change(formName, `${fieldName}.id`, paletteName));
  //     dispatch(change(formName, `${fieldName}.foregroundHex`, foregroundHex));
  //     dispatch(change(formName, `${fieldName}.backgroundHex`, backgroundHex));
  //   },
  //   [formName]
  // );

  const customPalette =
    currentPaletteOption?.id === CustomPaletteId
      ? currentPaletteOption
      : defaultCustomPaletteOption;

  return (
    <>
      <PaletteList>
        {paletteOptions.map((palette) => (
          <PaletteOption
            onClick={() => {
              onChange(palette);
            }}
            isSelected={
              !!currentPaletteOption?.id &&
              palette.id === currentPaletteOption?.id
            }
            paletteOption={palette}
            key={palette.id}
          ></PaletteOption>
        ))}
        <PaletteOption
          paletteOption={customPalette}
          onClick={() => onChange(defaultCustomPaletteOption)}
          isSelected={currentPaletteOption?.id === CustomPaletteId}
        />
      </PaletteList>
      {currentPaletteOption?.id === CustomPaletteId && (
        <CustomPaletteContainer>
          <h3>Choose a custom palette</h3>
          <CustomPalettePicker
            paletteOption={currentPaletteOption}
            onChange={onChange}
          />
        </CustomPaletteContainer>
      )}
    </>
  );
};

const CustomPaletteContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CustomPalettePicker = ({
  paletteOption,
  onChange,
}: {
  paletteOption: PaletteOption;
  onChange: (palette: PaletteOption) => void;
}) => {
  const handleChange =
    (paletteField: string, paletteIndex: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPaletteValue = set(
        `palette[${paletteIndex}].${paletteField}`,
        e.target.value,
        paletteOption
      );
      onChange(newPaletteValue);
    };

  return (
    <>
      {paletteOption.palettes.map((palette, index) => (
        <div key={index}>
          <h4>{palette.name}</h4>
          <PaletteColorRow>
            <InputColor
              type="color"
              value={palette?.foregroundHex}
              onChange={handleChange('foregroundHex', index)}
            />
            <InputLabel htmlFor="foregroundHex">Foreground colour</InputLabel>
          </PaletteColorRow>
          <PaletteColorRow>
            <InputColor
              type="color"
              value={palette?.backgroundHex}
              onChange={handleChange('backgroundHex', index)}
            />
            <InputLabel htmlFor="backgroundHex">Background colour</InputLabel>
          </PaletteColorRow>
        </div>
      ))}
    </>
  );
};

const PaletteColorRow = styled.div`
  display: flex;
  gap: 5px;
  padding-bottom: 5px;
`;

type PaletteSize = 'm' | 's';

export const PaletteItem = ({
  palette,
  size = 'm',
  onClick = noop,
  imageURL,
}: {
  palette: PaletteFacet;
  size?: 'm' | 's';
  onClick?: () => void;
  imageURL?: string;
}) => {
  const swatch = (
    <PaletteSwatch
      size={size}
      backgroundColor={palette.backgroundHex}
      foregroundColor={palette.foregroundHex}
      imageURL={imageURL}
    />
  );

  if (size === 's') {
    return swatch;
  }

  return (
    <PaletteSwatchWrapper onClick={onClick}>{swatch}</PaletteSwatchWrapper>
  );
};

const PaletteSwatch: React.FC<{
  backgroundColor: string;
  foregroundColor: string;
  size: PaletteSize;
  imageURL?: string;
}> = (props) => <PaletteContainer {...props}>Aa</PaletteContainer>;

const PaletteList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const PaletteHeading = styled.h4`
  margin-top: 0;
  text-align: center;
`;

const PaletteOptionWrapper = styled.div<{ isSelected: boolean }>`
  background-color: ${({ isSelected }) => (isSelected ? '#ddd' : '#eee')};
  outline: ${({ isSelected }) => (isSelected ? '2px solid #aaa' : 'none')};
  padding: 5px;
  border-radius: 5px;
`;

const PaletteOption = ({
  paletteOption: paletteOption,
  isSelected,
  onClick,
}: {
  paletteOption: PaletteOption;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <PaletteOptionWrapper isSelected={isSelected} onClick={onClick}>
    <PaletteHeading>{paletteOption.name}</PaletteHeading>
    {paletteOption.palettes.map((palette) => (
      <PaletteItem
        palette={palette}
        key={palette.name}
        imageURL={paletteOption.imageURL}
      />
    ))}
  </PaletteOptionWrapper>
);

const PaletteSwatchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  width: min-content;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
`;

const PaletteContainer = styled.div<{
  backgroundColor: string;
  foregroundColor: string;
  size: PaletteSize;
  imageURL?: string;
}>`
  display: flex;
  width: ${({ size }) => (size === 'm' ? '50px' : '40px')};
  height: ${({ size }) => (size === 'm' ? '50px' : '40px')};
  padding: 2px 5px;
  border-radius: 5px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  background-image: ${({ imageURL }) => `url(${imageURL})` ?? 'none'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  color: ${({ foregroundColor }) => foregroundColor};
  font-family: GHGuardianHeadline;
  font-weight: 700;
  justify-content: left;
  align-items: top;
  overflow: hidden;
`;
