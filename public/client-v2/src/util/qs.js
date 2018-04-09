// @flow

const enc = encodeURIComponent;

/**
 * Would use Object.entries but flow:
 * https://github.com/facebook/flow/issues/2221
 */
const qs = (o: { [key: string]: string }) =>
  `?${Object.keys(o)
    .map(key => `${enc(key)}=${enc(o[key])}`)
    .join('&')}`;

export { qs };
