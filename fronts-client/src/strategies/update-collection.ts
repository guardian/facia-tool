import type { State } from 'types/State';
import { updateCollection } from 'services/faciaApi';
import {
	updateEditionsCollection,
	renameEditionsCollection,
	updateCollectionRegions,
} from 'services/editionsApi';
import { runStrategy } from './run-strategy';
import { CollectionWithNestedArticles } from 'types/Collection';
import { EditionsCollection } from 'types/Edition';

const collectionToEditionCollection = (
	col: CollectionWithNestedArticles,
): EditionsCollection => {
	const { live, draft, isHidden, ...restCol } = col;
	return {
		...restCol,
		isHidden: isHidden || false,
		items: draft || [],
	};
};

export type CollectionUpdateMode = 'overwrite' | 'rename' | 'regions';

const updateCollectionStrategy = (
	state: State,
	id: string,
	collection: CollectionWithNestedArticles,
	mode: CollectionUpdateMode = 'overwrite',
) => {
	// const curatedPlatformStrategy = () =>
	// 	renamingCollection
	// 		? renameEditionsCollection(id)(collectionToEditionCollection(collection))
	// 		: isMarkedForUSOnly
	// 			? markCollectionForUSOnly(id)(collectionToEditionCollection(collection))
	// 			: updateEditionsCollection(id)(
	// 					collectionToEditionCollection(collection),
	// 				);
	const selectStrategy = () => {
		switch (mode) {
			case 'rename':
				return () =>
					renameEditionsCollection(id)(
						collectionToEditionCollection(collection),
					);
			case 'regions':
				return () =>
					updateCollectionRegions(id)(
						collectionToEditionCollection(collection),
					);
			case 'overwrite':
				return () =>
					updateEditionsCollection(id)(
						collectionToEditionCollection(collection),
					);
		}
	};
	const curatedPlatformStrategy = selectStrategy();

	return runStrategy<void>(state, {
		front: () => updateCollection(id)(collection),
		edition: curatedPlatformStrategy,
		feast: curatedPlatformStrategy,
		none: () => null,
	});
};

export { updateCollectionStrategy };
