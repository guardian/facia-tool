import { createSelector } from 'reselect';
import { State } from 'types/State';

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

const capiFeedSpecsSelector = createSelector(
  capiLiveURLSelector,
  capiPreviewURLSelector,
  (liveUrl, previewUrl) => [
    {
      name: 'Live',
      baseUrl: liveUrl
    },
    {
      name: 'Draft',
      baseUrl: previewUrl
    }
  ]
);

const collectionCapSelector = createSelector(
  configSelector,
  config => (config && config.collectionCap) || Infinity
);

export {
  capiLiveURLSelector,
  capiPreviewURLSelector,
  capiFeedSpecsSelector,
  selectUserEmail,
  selectFirstName,
  selectLastName,
  collectionCapSelector
};
