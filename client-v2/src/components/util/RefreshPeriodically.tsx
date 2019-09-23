import React, { useEffect, useState } from 'react';

const refreshPeriodically = ({
  rateMs,
  children: Child
}: {
  rateMs: number;
  children: React.ComponentType;
}) => {
  const [count, setCount] = useState(0);
  useEffect(
    () => {
      const interval = setInterval(() => {
        setCount(count + 1);
      }, rateMs);
      return () => clearInterval(interval);
    },
    [count]
  );

  return <Child />;
};

export default refreshPeriodically;
