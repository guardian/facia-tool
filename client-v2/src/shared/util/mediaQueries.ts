import {
  css,
  InterpolationValue,
  SimpleInterpolation
} from 'styled-components';

type Breakpoints = 'large' | 'medium' | 'small';

type BreakpointMap = { [Breakpoint in Breakpoints]: number };

const sizes = {
  large: 1280,
  medium: 992,
  small: 768
} as BreakpointMap;

type MediaQueryMap = {
  [Key in Breakpoints]: (
    strings: TemplateStringsArray,
    ...interpolations: SimpleInterpolation[]
  ) => InterpolationValue[]
};

/**
 * This object contains properties whose names correspond to breakpoints.
 * They contain values that accept tagged template literals, and we can use
 * them to construct media queries.
 *
 * For example --
 *
 * const Content = styled.div`
 *  ${media.desktop`background: dodgerblue;`}
 *  ${media.tablet`background: mediumseagreen;`}
 *  ${media.phone`background: palevioletred;`}
 * `;
 *
 * Cribbed from https://www.styled-components.com/docs/advanced.
 */
export const media = (Object.keys(sizes) as Breakpoints[]).reduce(
  (acc, label) => {
    acc[label] = (
      strings: TemplateStringsArray,
      ...interpolations: SimpleInterpolation[]
    ) =>
      css`
        @media (max-width: ${sizes[label]}px) {
          ${css(strings, ...interpolations)}
        }
      `;
    return acc;
  },
  {} as MediaQueryMap
);
