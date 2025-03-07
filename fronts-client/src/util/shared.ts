import {
	CollectionWithNestedArticles,
	Group,
	Collection,
	Card,
} from 'types/Collection';
import { selectors as collectionSelectors } from 'bundles/collectionsBundle';
import type { State } from 'types/State';

import { normalize, denormalize } from './schema';
import { CollectionConfig } from 'types/FaciaApi';
import v4 from 'uuid/v4';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';

const createGroup = (
	id: string | null,
	name: string | null,
	cards: string[] = [],
): Group => ({
	id,
	name,
	uuid: v4(),
	cards,
});

const getUUID = <T extends { uuid: string }>({ uuid }: T) => uuid;

const getGroupIndex = (id: string | null): number => parseInt(id || '0', 10);

const getAllCards = (groups: Group[]) =>
	groups.reduce((acc, { cards }) => [...acc, ...cards], [] as string[]);

const configGroupIndexExistsInGroups = (
	groupsToSearch: Group[],
	index: number,
): boolean =>
	groupsToSearch.some((group) => {
		if (group.id) {
			return parseInt(group.id, 10) === index;
		}
		return index === 0;
	});

const addGroupsForStage = (
	groupIds: string[],
	entities: { [id: string]: Group },
	collectionConfig: CollectionConfig,
) => {
	const groups = groupIds.map((id) => entities[id]);
	const groupsWithNames = groups.map((group) => {
		let name: string | null = null;
		const groupNumberAsInt = getGroupIndex(group.id);
		if (
			collectionConfig.groups &&
			groupNumberAsInt < collectionConfig.groups.length
		) {
			name = collectionConfig.groups[groupNumberAsInt];
		}
		//todo: check correct name
		if (collectionConfig.groupsConfig) {
			const groupConfig = collectionConfig.groupsConfig[groupNumberAsInt];
			if (name = groupConfig.name) {
				group.maxItems = groupConfig.maxItems;

			}

		}
		return { ...group, name };
	});

	// We may have empty groups in the config which would not show up in the normalised
	// groups result. We need to add these into the groups array.
	if (collectionConfig.groups) {
		collectionConfig.groups.forEach((group, configGroupIndex) => {
			if (!configGroupIndexExistsInGroups(groupsWithNames, configGroupIndex)) {
				groupsWithNames.push(createGroup(`${configGroupIndex}`, group));
			}
		});
	}

	// If we have no cards and no groups in a collection we still need to create
	// and empty group for articles.
	if (groupsWithNames.length === 0) {
		groupsWithNames.push(createGroup(null, null, getAllCards(groups)));
	}

	// We need to sort the groups according to their ids.
	const sortedGroupsWithNames = sortBy(
		groupsWithNames,
		(group) => -getGroupIndex(group.id),
	);

	// Finally, we need to filter out any groups that have maxItems set to 0 (e.g. in flex gen).
	const sortedNamedGroupsWithoutMaxItemSetToZero =
		!collectionConfig.groupsConfig
			? sortedGroupsWithNames
			: sortedGroupsWithNames.filter((group) => {
					const groupConfig = collectionConfig.groupsConfig?.find(
						(config) => config.name === group.name,
					);
					return groupConfig?.maxItems !== 0;
				});

	return {
		addedGroups: keyBy(sortedNamedGroupsWithoutMaxItemSetToZero, getUUID),
		groupIds: sortedNamedGroupsWithoutMaxItemSetToZero.map(getUUID),
	};

};

interface ReduceResult {
	live: string[];
	draft: string[];
	previously: string[];
	addedGroups: { [key: string]: Group };
}

const addGroups = (
	normalisedCollection: any,
	collectionConfig: CollectionConfig,
) =>
	(['live', 'previously', 'draft'] as ['live', 'previously', 'draft']).reduce(
		(acc, key) => {
			const { addedGroups, groupIds } = addGroupsForStage(
				normalisedCollection.result[key],
				normalisedCollection.entities.groups,
				collectionConfig,
			);
			return {
				...acc,
				addedGroups: {
					...acc.addedGroups,
					...addedGroups,
				},
				[key]: groupIds,
			};
		},
		{ live: [], draft: [], previously: [], addedGroups: {} } as ReduceResult,
	);

// To determine the UUIDs of cards recently removed from a collection in a way that
// preserves the overall ordering lost during normalisation (when cards are assigned to a Group)
// we need to compare both the pre-normalised and normalised versions of the same collection.
const createPreviouslyCardIds = (
	collection: CollectionWithNestedArticles,
	normalisedCollection: any,
) =>
	compact(collection.previously || []).map((nestedCard) => {
		const maybeCard = Object.entries(
			normalisedCollection.entities.cards as {
				[uuid: string]: Card;
			},
		).find(([_, article]) => article.id === nestedCard.id);
		return maybeCard ? maybeCard[0] : undefined;
	});

const normaliseCollectionWithNestedArticles = (
	collection: CollectionWithNestedArticles,
	collectionConfig: CollectionConfig,
): {
	normalisedCollection: Collection;
	groups: { [key: string]: Group };
	cards: { [key: string]: Card };
} => {
	const normalisedCollection = normalize(collection);
	const { addedGroups, live, draft, previously } = addGroups(
		normalisedCollection,
		collectionConfig,
	);
	const previouslyCardIds = createPreviouslyCardIds(
		collection,
		normalisedCollection,
	);
	return {
		normalisedCollection: {
			...normalisedCollection.result,
			live,
			draft,
			previously,
			previouslyCardIds,
		},
		groups: addedGroups,
		cards: normalisedCollection.entities.cards || {},
	};
};

function denormaliseCollection(
	state: State,
	id: string,
): CollectionWithNestedArticles {
	const collection = collectionSelectors.selectById(state, id);
	if (!collection) {
		throw new Error(
			`Could not denormalise collection - no collection found with id '${id}'`,
		);
	}

	return denormalize(collection, {
		cards: state.cards,
		groups: state.groups,
	});
}

export {
	normaliseCollectionWithNestedArticles,
	denormaliseCollection,
	createPreviouslyCardIds,
};
