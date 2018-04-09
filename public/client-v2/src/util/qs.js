// @flow

const enc = encodeURIComponent;

type StringableObject = {
  [key: string]: string
};

/**
 * Would use Object.entries but flow:
 * https://github.com/facebook/flow/issues/2221
 */
const qs = (o: StringableObject) =>
  `?${Object.keys(o)
    .map(key => `${enc(key)}=${enc(o[key])}`)
    .join('&')}`;

export { qs };
