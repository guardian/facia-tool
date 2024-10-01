import React, { useState, useLayoutEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface Dimensions {
	width: number | undefined;
	height: number | undefined;
}

interface Props {
	children: ({ width, height }: Dimensions) => JSX.Element;
}

const initialState = { width: undefined, height: undefined } as Dimensions;

/**
 * Supplies the dimensions of the wrapper div provided by this component to its children.
 *
 * ```
 * <WithDimensions>
 *  {({ width, height }) => (
 *    <p>`The dimensions of the parent div element are ${width} x ${height}`</p>
 *  )
 * </WithDimensions>
 * ```
 */
const WithDimensions = ({ children }: Props) => {
	const [dimensions, setDimensions] = useState(initialState);
	const ref: React.RefObject<HTMLDivElement> = React.createRef();
	useLayoutEffect(() => {
		if (!ref.current) {
			return;
		}
		const observer = new ResizeObserver(([firstEntry]) => {
			if (!firstEntry) {
				return;
			}
			const { width, height } = firstEntry.contentRect;
			setDimensions({ width, height });
		});

		observer.observe(ref.current);

		return () => observer.disconnect();
	}, []);
	return <div ref={ref}>{children(dimensions)}</div>;
};

export default WithDimensions;
