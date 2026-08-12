import { createSelector } from 'reselect';
import compact from 'lodash/compact';
import type { State } from 'types/State';
import { selectEditMode } from './pathSelectors';

const selectConfig = (state: State) => state.config;

const selectUserEmail = createSelector(
	selectConfig,
	(config) => config && config.email,
);
const selectFirstName = createSelector(
	selectConfig,
	(config) => config && config.firstName,
);
const selectLastName = createSelector(
	selectConfig,
	(config) => config && config.lastName,
);

const selectUserFullName = createSelector(
	selectFirstName,
	selectLastName,
	(firstName, lastName) => compact([firstName, lastName]).join(' '),
);

const selectCapiLiveURL = createSelector(
	selectConfig,
	(config) => config && config.capiLiveUrl,
);

const selectCapiPreviewURL = createSelector(
	selectConfig,
	(config) => config && config.capiPreviewUrl,
);

const selectCollectionCap = createSelector(
	selectConfig,
	selectEditMode,
	(config, editMode) =>
		(editMode === 'fronts' && config && config.collectionCap) || Infinity,
);

const selectGridUrl = createSelector(
	selectConfig,
	(config) => config && config.baseUrls.mediaBaseUrl,
);

const selectVideoBaseUrl = createSelector(
	selectConfig,
	(config) => config && config.baseUrls.videoBaseUrl,
);

const selectAvailableEditions = createSelector(
	selectConfig,
	(config) => config && config.availableTemplates,
);

const selectShouldUseCODELinks = createSelector(
	selectConfig,
	(config) => !config || config.env === 'code',
);

const selectEditionsPermission = createSelector(
	selectConfig,
	(config) => config && config.acl.editions,
);

const selectHasSubnavPermission = createSelector(selectConfig, (config) =>
	Boolean(config && config.acl.permissions['configure-subnavs']),
);

export {
	selectCapiLiveURL,
	selectCapiPreviewURL,
	selectUserEmail,
	selectFirstName,
	selectLastName,
	selectUserFullName,
	selectCollectionCap,
	selectGridUrl,
	selectVideoBaseUrl,
	selectAvailableEditions,
	selectShouldUseCODELinks,
	selectEditionsPermission,
	selectHasSubnavPermission,
};
