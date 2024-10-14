import { fetchStaleCollections, fetchArticles } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import {
	collectionsPollInterval,
	ophanPollInterval,
	collectionArticlesPollInterval,
} from 'constants/polling';
import { selectPriority } from 'selectors/pathSelectors';
import { getPageViewDataForCollection } from '../actions/PageViewData';
import { selectFeatureValue } from 'selectors/featureSwitchesSelectors';
import { selectExternalArticleIdFromCard } from 'selectors/shared';
import {
	selectOpenFrontsCollectionsAndArticles,
	selectOpenCardIds,
} from 'bundles/frontsUI';
import { createSelectCollectionsInOpenFronts } from 'bundles/frontsUI';

/**
 * TODO: do we want to check if there are any collectionUpdates going out here
 * could there be a race condition where we try to update a collection and poll
 * at the same time and the poll overwrites the update
 */
export default (store: Store) => {
	if ((window as any).IS_INTEGRATION) {
		return;
	}

	setInterval(createRefreshStaleCollections(store), collectionsPollInterval);
	setInterval(createRefreshOpenArticles(store), collectionArticlesPollInterval);

	const getState = (state: any) => state;

	const shouldPollOphan = selectFeatureValue(
		getState(store.getState()),
		'page-view-data-visualisation',
	);

	if (shouldPollOphan) {
		setInterval(createRefreshOphanData(store), ophanPollInterval);
	}
};

const selectCollectionsInOpenFronts = createSelectCollectionsInOpenFronts();

const createRefreshStaleCollections = (store: Store) => () => {
	const state = store.getState();
	const priority = selectPriority(state);
	if (!priority) {
		return;
	}

	const collectionIds = selectCollectionsInOpenFronts(state);
	(store.dispatch as Dispatch)(fetchStaleCollections(collectionIds));
};

const createRefreshOpenArticles = (store: Store) => () => {
	const state = store.getState();
	const openCardIds = selectOpenCardIds(state);
	const externalArticleIds = openCardIds
		.map((_) => selectExternalArticleIdFromCard(state, _))
		.filter((_) => _) as string[];
	(store.dispatch as Dispatch)(fetchArticles(externalArticleIds));
};

const createRefreshOphanData = (store: Store) => () => {
	const state = store.getState();
	const openFrontsCollectionAndArticles =
		selectOpenFrontsCollectionsAndArticles(state);
	openFrontsCollectionAndArticles.forEach((front) => {
		front.collections.forEach((collection) => {
			if (collection.articleIds.length > 0) {
				(store.dispatch as Dispatch)(
					getPageViewDataForCollection(front.frontId, collection.id, 'draft'),
				);
			}
		});
	});
};
