/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'shared/constants/theme';`
 */

import baseStyled, { ThemedStyledInterface } from 'styled-components';

const colors = {
  blackDark: '#121212', // darkest
  blackLight: '#333',
  greyDark: '#444444', //
  greyMediumDark: '#515151',
  greyMedium: '#767676', //
  greyMediumLight: '#999999',
  greyLight: '#A9A9A9',
  greyLightPinkish: '#C9C9C9',
  whiteDark: '#DCDCDC',
  whiteMedium: '#EDEDED',
  whiteLight: '#F6F6F6',
  white: '#FFF', // lightest
  orange: '#FF7F0F',
  orangeLight: '#FD8A2E',
  orangeDark: '#E05E00'
};

const base = {
  colors: {
    text: colors.blackLight,
    textMuted: colors.greyMediumLight,
    textLight: colors.white,
    textDark: colors.blackDark,
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
interface SharedTheme {
  shared: Theme;
}
export const styled = baseStyled as ThemedStyledInterface<SharedTheme>;
