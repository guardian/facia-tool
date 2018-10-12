

/**
 * Safely get a nested property from an object.
 *
 * @param {Object} obj
 * @param {string[]} properties
 */
export default function deepGet(obj: Object, properties: string[]) {
  if (obj === undefined || obj === null) {
    return null;
  }

  if (properties.length === 0) {
    return obj;
  }

  const foundSoFar = obj[properties[0]];
  const remainingProperties = properties.slice(1);

  return deepGet(foundSoFar, remainingProperties);
}
