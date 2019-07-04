/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'constants/theme';`
 */
import { theme as shared } from 'shared/constants/theme';
import baseStyled, { ThemedStyledInterface } from 'styled-components';

const base = {
  colors: {
    radioButtonBackgroundDisabled: '#E6E6E6',
    radioButtonSelected: shared.colors.blackDark,
    dropZone: '#D6D6D6',
    frontListBorder: '#5E5E5E',
    frontListLabel: shared.colors.greyMediumLight,
    frontListButton: shared.colors.greyDark
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

export const theme = {
  shared,
  base,
  capiInterface
};

export type Theme = typeof theme;
export const styled = baseStyled as ThemedStyledInterface<Theme>;
