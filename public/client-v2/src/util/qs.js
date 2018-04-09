const enc = encodeURIComponent;

const qs = o =>
  `?${Object.entries(o)
    .map(([key, value]) => `${enc(key)}=${enc(value)}`)
    .join('&')}`;

export { qs };
