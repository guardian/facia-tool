

import { createSelector } from 'reselect';
import { type State } from 'types/State';

const configSelector = (state: State) => state.config;

const selectUserEmail = createSelector(configSelector, config => config.email);
const selectFirstName = createSelector(
  configSelector,
  config => config.firstName
);
const selectLastName = createSelector(
  configSelector,
  config => config.lastName
);

const capiLiveURLSelector = createSelector(
  configSelector,
  config => config.capiLiveUrl
);

const capiPreviewURLSelector = createSelector(
  configSelector,
  config => config.capiPreviewUrl
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

export {
  capiLiveURLSelector,
  capiPreviewURLSelector,
  capiFeedSpecsSelector,
  selectUserEmail,
  selectFirstName,
  selectLastName
};
