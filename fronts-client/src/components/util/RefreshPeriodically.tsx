import React, { useEffect, useState } from 'react';

/**
 * Periodically forces a rerender on this component's children.
 * Useful for making sure that e.g. dates-from-now on a page don't become stale.
 *
 * Example usage: ```
 *  <RefreshPeriodically rateMs={1000}>
 *    <div>{distanceFromNow(date)}</div>
 *  </RefreshPeriodically>
 * ```
 */
const refreshPeriodically = ({
	rateMs,
	children: Child,
}: {
	rateMs: number;
	children: React.ComponentType;
}) => {
	const [count, setCount] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setCount(count + 1);
		}, rateMs);
		return () => clearInterval(interval);
	}, [count]);

	return <Child />;
};

export default refreshPeriodically;
