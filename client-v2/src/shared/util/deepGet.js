// @flow

export default function deepGet(obj: Object, properties: string[]) {
  // If we have reached an undefined/null property
  // then stop executing and return undefined.
  if (obj === undefined || obj === null) {
    return null;
  }

  // If the path array has no more elements, we've reached
  // the intended property and return its value.
  if (properties.length === 0) {
    return obj;
  }

  // Prepare our found property and path array for recursion
  const foundSoFar = obj[properties[0]];
  const remainingProperties = properties.slice(1);

  return deepGet(foundSoFar, remainingProperties);
}
