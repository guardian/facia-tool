/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'shared/constants/theme';`
 */

import baseStyled, {
  css as baseCss,
  ThemedStyledInterface,
  ThemedCssFunction
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
  orangeLight: '#FD8A2E',
  orangeDark: '#E05E00',
  orangeFaded: '#D08B5A',
  yellow: '#FFE500',
  green: '#4F9245'
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
    placeholderDark: colors.greyLight,
    focusColor: colors.orange
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
  radioButtonBackgroundDisabled: '#E6E6E6'
};

const collection = {
  background: '#e5e5e5'
};

const label = {
  fontSize: '14px',
  fontSizeSmall: '12px',
  lineHeight: '24px'
};

const collectionItem = {
  fontSizeDefault: '14px',
  fontSizeSmall: '13px',
  dropZone: '#D6D6D6',
  border: colors.greyLightPinkish,
  backgroundHover: colors.whiteMedium
};

const thumbnailImage = {
  width: '83px',
  height: '50px'
}

export const theme = {
  colors,
  base,
  button,
  input,
  label,
  collectionItem,
  collection,
  thumbnailImage
};

export type Theme = typeof theme;
interface SharedTheme {
  shared: Theme;
}

export const styled = baseStyled as ThemedStyledInterface<SharedTheme>;
export const css = baseCss as ThemedCssFunction<SharedTheme>;
