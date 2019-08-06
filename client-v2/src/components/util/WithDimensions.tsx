import { useState, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface Dimensions {
  width: number | undefined;
  height: number | undefined;
}

interface Props {
  element: HTMLElement | null | undefined;
  children: ({ width, height }: Dimensions) => JSX.Element;
}

const initialState = { width: undefined, height: undefined } as Dimensions;

/**
 * Supplies the dimensions of the given element to its children.
 *
 * ```
 * <WithDimensions element={this.someHTMLElement}>
 *  {({ width, height }) => (
 *    <p>`The dimensions of the given element are ${width} x ${height}`</p>
 *  )
 * </WithDimensions>
 * ```
 */
const WithDimensions = ({ element, children }: Props) => {
  const [dimensions, setDimensions] = useState(initialState);
  useEffect(
    () => {
      if (!element) {
        return;
      }
      const observer = new ResizeObserver(([firstEntry]) => {
        if (!firstEntry) {
          return;
        }
        const { width, height } = firstEntry.contentRect;
        setDimensions({ width, height });
      });

      observer.observe(element);

      return () => observer.disconnect();
    },
    [element]
  );
  return children(dimensions);
};

export default WithDimensions;
