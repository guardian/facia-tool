import React, { useEffect, useState } from 'react';

const refreshPeriodically = ({
  timeMs,
  children: Child
}: {
  timeMs: number;
  children: React.ComponentType;
}) => {
  const [count, setCount] = useState(0);
  useEffect(
    () => {
      const interval = setInterval(() => {
        setCount(count + 1);
      }, timeMs);
      return () => clearInterval(interval);
    },
    [count]
  );

  return <Child />;
};

export default refreshPeriodically;
