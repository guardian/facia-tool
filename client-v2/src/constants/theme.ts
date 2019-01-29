/* Strongly-typed theme property:
 *  The default 'styled' method from styled-components is typed with 'any'.
 *  To use the strongly-typed theme from this file, in your components
 *  replace: `import styled from 'styled-components';`
 *  with : `import { styled } from 'constants/theme';`
 */
import { theme as sharedTheme } from 'shared/constants/theme';
import baseStyled, { ThemedStyledInterface } from 'styled-components';

/* Additional styling exclusive to the application
 *  should be added to the extendedTheme type object
 *  along with the shared component library theme.
 */
const extendedTheme = { sharedTheme };

export type Theme = typeof extendedTheme;
export const styled = baseStyled as ThemedStyledInterface<Theme>;
