import createAsyncResourceBundle, {
	State,
} from 'lib/createAsyncResourceBundle';
import {
	CollectionConfigMap,
	FrontConfigMap,
	FrontsConfig,
} from 'types/FaciaApi';
import { EditionsFront } from '../types/Edition';

export const { actions, actionNames, reducer, selectors, initialState } =
	createAsyncResourceBundle<FrontsConfig>('frontsConfig', {
		indexById: false,
		selectLocalState: (state) => state.fronts.frontsConfig,
		initialData: {
			fronts: {},
			collections: {},
		},
	});

export const toFrontsConfig = (
	editionFronts: EditionsFront[],
	issueId: string,
): FrontsConfig => {
	const fronts: FrontConfigMap = {};
	const collections: CollectionConfigMap = {};

	editionFronts.forEach((front) => {
		fronts[front.id] = {
			...front,
			collections: front.collections.map((collection) => collection.id),
			priority: issueId,
		};
		front.collections.forEach((collection) => {
			collections[collection.id] = {
				...collection,
				displayName: collection.displayName,
			};
		});
	});

	return { fronts, collections };
};

export type FrontsConfigState = State<FrontsConfig>;
