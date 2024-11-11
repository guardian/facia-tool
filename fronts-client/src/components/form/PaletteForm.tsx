import React from 'react';
import set from 'lodash/fp/set';
import upperFirst from 'lodash/upperFirst';
import {
	CustomPaletteId,
	PaletteFacet,
	PaletteOption,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import InputLabel from 'components/inputs/InputLabel';
import { InputColor } from 'components/inputs/InputColor';
import { entries } from 'util/object';

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
		(paletteField: string, paletteKey: string) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newPaletteValue = set(
				`palettes.${paletteKey}.${paletteField}`,
				e.target.value,
				paletteOption,
			);

			onChange(newPaletteValue);
		};

	return (
		<>
			{entries(paletteOption.palettes).map(([paletteName, palette]) => (
				<div key={paletteName}>
					<h4>{upperFirst(paletteName)}</h4>
					<PaletteColorRow>
						<InputColor
							type="color"
							value={palette?.foregroundHex}
							onChange={handleChange('foregroundHex', paletteName)}
						/>
						<InputLabel htmlFor="foregroundHex">Foreground colour</InputLabel>
					</PaletteColorRow>
					<PaletteColorRow>
						<InputColor
							type="color"
							value={palette?.backgroundHex}
							onChange={handleChange('backgroundHex', paletteName)}
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
	imageURL,
}: {
	palette: PaletteFacet;
	size?: 'm' | 's';
	imageURL?: string;
}) => (
	<Swatch
		size={size}
		backgroundColor={palette.backgroundHex}
		foregroundColor={palette.foregroundHex}
		imageURL={imageURL}
	>
		Aa
	</Swatch>
);

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
		{entries(paletteOption.palettes).map(([paletteName, palette]) => (
			<PaletteSwatchWrapper onClick={onClick}>
				<PaletteItem
					palette={palette}
					key={paletteName}
					imageURL={paletteOption.imageURL}
				/>
			</PaletteSwatchWrapper>
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

const Swatch = styled.div<{
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
