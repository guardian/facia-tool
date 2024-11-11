/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'constants/theme';`
 */
import baseStyled, {
	css as baseCss,
	ThemedStyledInterface,
	ThemedCssFunction,
} from 'styled-components';

const colors = {
	blackDark: '#121212', // darkest
	blackLight: '#333',
	greyDark: '#444444',
	greyMediumDark: '#515151',
	greyMediumDarkish: '#676767',
	greyMedium: '#767676',
	greyMediumLight: '#999999',
	greyLight: '#A9A9A9',
	greyVeryLight: '#c9c9c9',
	greyLightPinkish: '#C9C9C9',
	whiteDark: '#DCDCDC',
	whiteMedium: '#EDEDED',
	whiteLight: '#F6F6F6',
	white: '#FFF', // lightest
	orange: '#FF7F0F',
	orangeVeryLight: '#FFE9D6',
	orangeLight: '#FD8A2E',
	orangeDark: '#E05E00',
	orangeFaded: '#D08B5A',
	yellow: '#FFE500',
	green: '#4F9245',
	greenDark: '#36842A',
	greenLight: '#ddead9',
	red: '#d01d00',
	blackTransparent20: 'rgba(0,0,0,0.2)',
	blackTransparent40: 'rgba(0,0,0,0.4)',
	blackTransparent60: 'rgba(0,0,0,0.6)',
};

const base = {
	colors: {
		radioButtonBackgroundDisabled: '#E6E6E6',
		radioButtonSelected: colors.blackDark,
		dropZone: '#D6D6D6',
		frontListBorder: '#5E5E5E',
		frontListLabel: colors.greyMediumLight,
		frontListButton: colors.greyDark,
		formBackground: '#dcdcdc',
		dropZoneActiveSublink: '#36842A',
		dropZoneActiveStory: '#117ABB',
		text: colors.blackLight,
		textMuted: colors.greyMediumLight,
		textLight: colors.white,
		textDark: colors.blackDark,
		brandColor: colors.orange,
		brandColorLight: colors.orangeVeryLight,
		highlightColor: colors.orange,
		highlightColorFocused: colors.orangeLight,
		button: colors.blackLight,
		buttonFocused: colors.greyMediumDark,
		backgroundColor: colors.whiteLight,
		backgroundColorLight: colors.white,
		backgroundColorFocused: colors.whiteMedium,
		borderColor: colors.greyLightPinkish,
		borderColorFocus: colors.greyLight,
		placeholderLight: colors.greyLightPinkish,
		placeholderDark: colors.greyLight,
		focusColor: colors.orange,
		dangerColor: colors.red,
	},
};

const capiInterface = {
	feedItemText: '#221133', // deep purple
	text: colors.blackDark,
	textLight: colors.greyLightPinkish,
	textVisited: colors.greyMediumLight,
	textPlaceholder: colors.greyMedium,
	border: colors.greyDark,
	borderLight: colors.greyLightPinkish,
	backgroundDark: colors.whiteDark,
	backgroundLight: colors.whiteLight,
	backgroundWhite: colors.white,
	backgroundSelected: colors.orange,
};

const front = {
	frontListBorder: '#5E5E5E',
	frontListLabel: colors.greyMediumLight,
	frontListButton: colors.greyDark,
	minWidth: 380,
	overviewMinWidth: 160,
	paddingForAddFrontButton: 80,
};

const form = {
	formBackground: '#dcdcdc',
};

const layout = {
	sectionHeaderHeight: 40,
};

const button = {
	color: base.colors.textLight,
	backgroundColor: base.colors.button,
	backgroundColorFocused: base.colors.buttonFocused,
	backgroundColorHighlight: base.colors.highlightColor,
	backgroundColorHighlightFocused: base.colors.highlightColorFocused,
};

const input = {
	height: '30px',
	paddingY: '3px',
	paddingX: '5px',
	fontSize: '14px',
	fontSizeHeadline: '16px',
	color: base.colors.text,
	colorLabel: colors.greyMediumDarkish,
	backgroundColor: base.colors.backgroundColorLight,
	borderColor: base.colors.borderColor,
	borderColorFocus: base.colors.borderColorFocus,
	checkboxBorderColor: colors.greyLight,
	checkboxColorInactive: base.colors.backgroundColorLight,
	checkboxBorderColorInactive: base.colors.borderColor,
	checkboxColorActive: base.colors.highlightColor,
	placeholderText: base.colors.placeholderDark,
	radioButtonBackgroundDisabled: '#E6E6E6',
};

const collection = {
	background: '#e5e5e5',
};

const label = {
	fontSize: '14px',
	fontSizeSmall: '12px',
	lineHeight: '24px',
};

const card = {
	fontSizeDefault: '14px',
	fontSizeSmall: '13px',
	dropZone: '#D6D6D6',
	border: colors.greyLightPinkish,
	backgroundHover: colors.whiteMedium,
};

const thumbnailImage = {
	width: '83px',
	height: '50px',
};

const thumbnailImageSquare = {
	width: '50px',
	height: '50px',
};

export const theme = {
	base,
	front,
	form,
	capiInterface,
	layout,
	colors,
	button,
	input,
	label,
	card,
	collection,
	thumbnailImage,
	thumbnailImageSquare,
};

export type Theme = typeof theme;

export const css = baseCss as ThemedCssFunction<Theme>;
export const styled = baseStyled as ThemedStyledInterface<Theme>;
