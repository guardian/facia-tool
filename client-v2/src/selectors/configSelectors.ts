import { createSelector } from 'reselect';
import { State } from 'types/State';
import { selectIsEditingEditions } from './pathSelectors';

const configSelector = (state: State) => state.config;

const selectUserEmail = createSelector(
  configSelector,
  config => config && config.email
);
const selectFirstName = createSelector(
  configSelector,
  config => config && config.firstName
);
const selectLastName = createSelector(
  configSelector,
  config => config && config.lastName
);

const capiLiveURLSelector = createSelector(
  configSelector,
  config => config && config.capiLiveUrl
);

const capiPreviewURLSelector = createSelector(
  configSelector,
  config => config && config.capiPreviewUrl
);

const collectionCapSelector = createSelector(
  configSelector,
  selectIsEditingEditions,
  (config, isEditingEditions) =>
    (!isEditingEditions && config && config.collectionCap) || Infinity
);

const gridUrlSelector = createSelector(
  configSelector,
  config => config && config.mediaBaseUrl
);

export {
  capiLiveURLSelector,
  capiPreviewURLSelector,
  selectUserEmail,
  selectFirstName,
  selectLastName,
  collectionCapSelector,
  gridUrlSelector
};
