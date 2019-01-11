import baseStyled, { ThemedStyledInterface } from 'styled-components';

const colors = {
  blackDark: '#121212', // darkest
  blackLight: '#333',
  greyDark: '#515151',
  greyMedium: '#999999',
  greyLight: '#A9A9A9',
  greyLightPinkish: '#C9C9C9',
  whiteFour: '#DCDCDC',
  whiteThree: '#EDEDED',
  whiteTwo: '#F6F6F6',
  white: '#FFF', // lightest
  orange: '#FF7F0F',
  orangeLight: '#FD8A2E',
  orangeDark: '#E05E00'
};

const base = {
  colors: {
    text: colors.blackLight,
    textMuted: colors.greyMedium,
    textLight: colors.white,
    textDark: colors.blackDark,
    highlightColor: colors.orange,
    highlightColorFocused: colors.orangeLight,
    button: colors.blackLight,
    buttonFocused: colors.greyDark,
    backgroundColor: colors.whiteTwo,
    backgroundColorLight: colors.white,
    backgroundColorFocused: colors.whiteThree,
    borderColor: colors.greyLightPinkish,
    borderColorFocus: colors.greyLight,
    placeholderLight: colors.greyLightPinkish,
    placeholderDark: colors.greyLight
  }
};

const button = {
  color: base.colors.textLight,
  backgroundColor: base.colors.button,
  backgroundColorFocused: base.colors.buttonFocused,
  backgroundColorHighlight: base.colors.highlightColor,
  backgroundColorHighlightFocused: base.colors.highlightColorFocused
};

const input = {
  height: '34px',
  paddingY: '3px',
  paddingX: '5px',
  fontSize: '14px',
  fontSizeHeadline: '16px',
  color: base.colors.text,
  backgroundColor: base.colors.backgroundColorLight,
  borderColor: base.colors.borderColor,
  borderColorFocus: base.colors.borderColorFocus,
  checkboxColorInactive: base.colors.backgroundColorLight,
  checkboxBorderColorInactive: base.colors.borderColor,
  checkboxColorActive: base.colors.highlightColor,
  placeholderText: base.colors.placeholderDark
};

const label = {
  fontSize: '14px',
  fontSizeSmall: '12px',
  lineHeight: '24px'
};

export const theme = {
  colors,
  base,
  button,
  input,
  label
};

export type Theme = typeof theme;
export const styled = baseStyled as ThemedStyledInterface<Theme>;
