// @flow

import { createSelector } from 'reselect';

import type { State } from '../types/State';
import type { Collection } from '../types/Collection';

const allCollectionsSelector = (state: State): { [string]: Collection } =>
  state.collections;

const collectionIdSelector = (_: State, id: string) => id;

const getCollection = (
  collections: { [string]: Collection },
  id: string
): ?Collection => {
  if (!collections) {
    return null;
  }
  return collections[id];
};

const collectionSelector = createSelector(
  [allCollectionsSelector, collectionIdSelector],
  getCollection
);

export { collectionSelector };
