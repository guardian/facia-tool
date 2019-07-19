/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'constants/theme';`
 */
import { theme as shared } from 'shared/constants/theme';
import baseStyled, {
  css as baseCss,
  ThemedStyledInterface,
  ThemedCssFunction
} from 'styled-components';

const base = {
  colors: {
    radioButtonBackgroundDisabled: '#E6E6E6',
    radioButtonSelected: shared.colors.blackDark,
    dropZone: '#D6D6D6',
    frontListBorder: '#5E5E5E',
    frontListLabel: shared.colors.greyMediumLight,
    frontListButton: shared.colors.greyDark,
    formBackground: '#dcdcdc',
    dropZoneActiveSublink: '#36842A',
    dropZoneActiveStory: '#117ABB'
  }
};

const capiInterface = {
  feedItemText: '#221133', // deep purple
  text: shared.colors.blackDark,
  textLight: shared.colors.greyLightPinkish,
  textVisited: shared.colors.greyMediumLight,
  textPlaceholder: shared.colors.greyMedium,
  border: shared.colors.greyDark,
  borderLight: shared.colors.greyLightPinkish,
  backgroundDark: shared.colors.whiteDark,
  backgroundLight: shared.colors.whiteLight,
  backgroundWhite: shared.colors.white,
  backgroundSelected: shared.colors.orange
};

const front = {
  frontListBorder: '#5E5E5E',
  frontListLabel: shared.colors.greyMediumLight,
  frontListButton: shared.colors.greyDark
};

const form = {
  formBackground: '#dcdcdc'
};

const layout = {
  sectionHeaderHeight: 40
};

export const theme = {
  shared,
  base,
  front,
  form,
  capiInterface,
  layout
};

export type Theme = typeof theme;

export const css = baseCss as ThemedCssFunction<Theme>;
export const styled = baseStyled as ThemedStyledInterface<Theme>;
