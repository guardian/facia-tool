import { createSelector } from 'reselect';
import { State } from 'types/State';
import { selectEditMode } from './pathSelectors';

const selectConfig = (state: State) => state.config;

const selectUserEmail = createSelector(
  selectConfig,
  (config) => config && config.email
);
const selectFirstName = createSelector(
  selectConfig,
  (config) => config && config.firstName
);
const selectLastName = createSelector(
  selectConfig,
  (config) => config && config.lastName
);

const selectCapiLiveURL = createSelector(
  selectConfig,
  (config) => config && config.capiLiveUrl
);

const selectCapiPreviewURL = createSelector(
  selectConfig,
  (config) => config && config.capiPreviewUrl
);

const selectCollectionCap = createSelector(
  selectConfig,
  selectEditMode,
  (config, editMode) =>
    (editMode === 'fronts' && config && config.collectionCap) || Infinity
);

const selectGridUrl = createSelector(
  selectConfig,
  (config) => config && config.mediaBaseUrl
);

export {
  selectCapiLiveURL,
  selectCapiPreviewURL,
  selectUserEmail,
  selectFirstName,
  selectLastName,
  selectCollectionCap,
  selectGridUrl,
};
