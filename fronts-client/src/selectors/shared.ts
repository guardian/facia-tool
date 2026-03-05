import omit from 'lodash/omit';
import { createSelector } from 'reselect';
import {
	getThumbnail,
	getPrimaryTag,
	getContributorImage,
	isLive,
} from 'util/CAPIUtils';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import { ExternalArticle } from '../types/ExternalArticle';
import {
	Card,
	Collection,
	Group,
	CardSets,
	CardDenormalised,
	ArticleTag,
	CollectionMap,
	GroupMap,
	CardMap,
} from '../types/Collection';
import type { State } from 'types/State';
import { cardSets } from 'constants/fronts';
import { createShallowEqualResultSelector } from 'util/selectorUtils';
import { DerivedArticle } from 'types/Article';
import { hasMainVideo } from 'util/externalArticle';
import { selectors as frontsConfigSelectors } from '../bundles/frontsConfigBundle';
import { FrontConfigMap } from 'types/FaciaApi';

const selectCollectionMap: (state: State) => CollectionMap =
	collectionSelectors.selectAll;
const selectGroupMap = (state: State): GroupMap => state.groups;
const selectCardMap = (state: State): CardMap => state.cards;

const selectCardsFromRootState = (state: State) => selectCardMap(state);

const selectGroupsFromRootState = (state: State) => selectGroupMap(state);

const selectCard = (state: State, id: string): Card => state.cards[id];

const selectExternalArticleFromCard = (
	state: State,
	id: string,
): ExternalArticle | undefined => {
	const card = selectCard(state, id);
	const externalArticles = externalArticleSelectors.selectAll(state);
	if (!card) {
		return undefined;
	}
	return externalArticles[card.id];
};

const selectSupportingArticleCount = (state: State, uuid: string) => {
	const maybeArticle = selectCard(state, uuid);
	if (maybeArticle && maybeArticle.meta.supporting) {
		return maybeArticle.meta.supporting.length;
	}
	return 0;
};

const selectArticleTag = (state: State, id: string): ArticleTag => {
	const externalArticle = selectExternalArticleFromCard(state, id);
	const emptyTag = {
		webTitle: undefined,
		sectionName: undefined,
	};

	if (!externalArticle) {
		return emptyTag;
	}

	const tag = getPrimaryTag(externalArticle);

	if (tag) {
		return {
			webTitle: tag.webTitle,
			sectionName: tag.sectionName,
		};
	}
	return emptyTag;
};

const selectArticleKicker = (state: State, id: string): string | undefined => {
	const card = selectCard(state, id);

	if (!card) {
		return undefined;
	}

	const kickerOptions = selectArticleTag(state, id);
	const meta = card.meta;

	if (!card) {
		return undefined;
	}
	if (meta.showKickerTag) {
		return kickerOptions.webTitle;
	}

	if (meta.showKickerSection) {
		return kickerOptions.sectionName;
	}

	if (meta.showKickerCustom) {
		return meta.customKicker;
	}

	return undefined;
};

const selectCardHasMediaOverrides = (state: State, id: string) => {
	const article = selectCard(state, id);
	return (
		!!article &&
		!!article.meta &&
		(!!article.meta.imageCutoutReplace ||
			!!article.meta.imageReplace ||
			!!article.meta.imageSlideshowReplace)
	);
};

const createSelectIsCardLive = () =>
	createSelector(
		selectExternalArticleFromCard,
		(externalArticle) => !!externalArticle && isLive(externalArticle),
	);

const createSelectArticleFromCard = () =>
	createSelector(
		selectExternalArticleFromCard,
		selectCard,
		selectArticleKicker,
		(externalArticle, card, kicker): DerivedArticle | undefined => {
			if (!card) {
				return undefined;
			}

			const articleMeta = externalArticle
				? { ...externalArticle.frontsMeta.defaults, ...card.meta }
				: card.meta;

			return {
				...omit(externalArticle || {}, 'fields', 'frontsMeta'),
				...(externalArticle ? externalArticle.fields : {}),
				...omit(card, 'meta'),
				...articleMeta,
				headline:
					card.meta.headline ||
					(externalArticle ? externalArticle.fields.headline : undefined),
				trailText:
					card.meta.trailText ||
					(externalArticle ? externalArticle.fields.trailText : undefined),
				byline:
					card.meta.byline ||
					(externalArticle ? externalArticle.fields.byline : undefined),
				kicker,
				pickedKicker: externalArticle
					? externalArticle.frontsMeta.pickedKicker
					: undefined,
				pillarId: externalArticle ? externalArticle.pillarId : undefined,
				thumbnail: getThumbnail(articleMeta, externalArticle),
				cutoutThumbnail: externalArticle
					? getContributorImage(externalArticle)
					: undefined,
				isLive: !!externalArticle && isLive(externalArticle),
				firstPublicationDate: externalArticle
					? externalArticle.fields.firstPublicationDate
					: undefined,
				frontPublicationDate: card.frontPublicationDate,
				tone: externalArticle ? externalArticle.frontsMeta.tone : undefined,
				hasMainVideo: !!externalArticle && hasMainVideo(externalArticle),
				showMainVideo: !!articleMeta.showMainVideo,
				urlPath: externalArticle && externalArticle.urlPath,
			};
		},
	);

const selectCollectionId = (
	_state: State,
	{ collectionId }: { collectionId: string },
) => collectionId;

const createSelectCollection = () =>
	createSelector(
		selectCollectionMap,
		selectCollectionId,
		(collections: CollectionMap, collectionUuid: string) =>
			collections[collectionUuid],
	);

const selectStage = (
	_: unknown,
	{ collectionSet }: { collectionSet: CardSets; collectionId: string },
): CardSets => collectionSet;

const createSelectCollectionStageGroups = () => {
	const selectCollection = createSelectCollection();
	return createShallowEqualResultSelector(
		selectCollection,
		selectGroupMap,
		selectStage,
		(
			collection: Collection | void,
			groups: { [id: string]: Group },
			stage: CardSets,
		): Group[] => {
			const grps = ((collection && collection[stage]) || []).map(
				(id) => groups[id],
			);
			if (grps.length < 2) {
				return grps;
			}

			// Groups without names and ids are groups which no longer exist in the config because
			// the collection layout has changed. We need to collect the cards in these
			// groups and display them in the top group.
			const orphanedCards: string[] = grps
				.filter((grp) => !grp.name && grp.id)
				.reduce((frags: string[], g) => frags.concat(g.cards), []);

			// The final array of groups consist of groups where all groups without names but with ids
			// are filtered out as these groups no longer exist in the config of the collection.
			const finalGroups = grps.filter((grp) => grp.name || !grp.id);
			if (finalGroups.length > 0) {
				const originalFirstGroupCards = finalGroups[0].cards;
				const firstGroupCards = orphanedCards.concat(originalFirstGroupCards);
				const firstGroup = {
					...finalGroups[0],
					...{ cards: firstGroupCards },
				};
				finalGroups[0] = firstGroup;
			}
			return finalGroups;
		},
	);
};

const createSelectPreviouslyLiveArticlesInCollection = () => {
	const selectCollection = createSelectCollection();
	return createShallowEqualResultSelector(
		selectCollection,
		// All components that display articles do so using Groups. As a result, we have to create
		// a Group here, to be able to render the previously removed articles.
		// This will return the UUIDs for the 5 most recently removed articles.
		// TODO: consider how we could change this interface, so we don't need to create this.
		(collection: Collection | void): Group => ({
			id: null,
			name: null,
			uuid: 'previously',
			cards: ((collection && collection.previouslyCardIds) || []).slice(0, 5),
		}),
	);
};

const createSelectCollectionEditWarning = () => {
	const selectCollection = createSelectCollection();
	return createSelector(
		selectCollection,
		(collection: Collection | void): boolean =>
			!!(
				collection &&
				collection.frontsToolSettings &&
				collection.frontsToolSettings.displayEditWarning
			),
	);
};

const selectGroupName = (
	_: unknown,
	{
		groupName,
	}: {
		groupName?: string;
		includeSupportingArticles?: boolean;
		collectionSet: CardSets;
		collectionId: string;
	},
) => groupName;

const selectIncludeSupportingArticles = (
	_: unknown,
	{
		includeSupportingArticles,
	}: {
		groupName?: string;
		includeSupportingArticles?: boolean;
		collectionSet: CardSets;
		collectionId: string;
	},
) => includeSupportingArticles;

const createSelectCardsInCollectionGroup = () => {
	const selectCollectionStageGroups = createSelectCollectionStageGroups();
	return createShallowEqualResultSelector(
		selectCardMap,
		selectCollectionStageGroups,
		selectGroupName,
		selectIncludeSupportingArticles,
		(cards, collectionGroups, groupName, includeSupportingCards = true) => {
			const groups = groupName
				? [
						collectionGroups.find(({ id }) => id === groupName) || {
							cards: [],
						},
					]
				: collectionGroups;
			const groupCardIds = groups.reduce(
				(acc, group) => acc.concat(group.cards || []),
				[] as string[],
			);
			if (!includeSupportingCards) {
				return groupCardIds;
			}
			return groupCardIds.reduce((acc, id) => {
				const card = cards[id];
				if (
					!card ||
					!card.meta ||
					!card.meta.supporting ||
					!card.meta.supporting.length
				) {
					return acc.concat(id);
				}
				return acc.concat(id, card.meta.supporting);
			}, [] as string[]);
		},
	);
};

const createSelectCardsInCollection = () => {
	const selectCardsInCollectionGroups = createSelectCardsInCollectionGroup();
	return (
		state: State,
		{
			collectionId,
			collectionSet,
			includeSupportingArticles = true,
		}: {
			collectionId: string;
			collectionSet: CardSets;
			includeSupportingArticles?: boolean;
		},
	) =>
		selectCardsInCollectionGroups(state, {
			collectionId,
			collectionSet,
			includeSupportingArticles,
		});
};

const createSelectAllCardsInCollection = () => {
	const selectCardsInCollection = createSelectCardsInCollection();

	return (state: State, collectionIds: string[]) =>
		collectionIds.reduce(
			(acc, id) => [
				...acc,
				...Object.values(cardSets).reduce(
					(acc1, collectionSet) => [
						...acc1,
						...selectCardsInCollection(state, {
							collectionId: id,
							collectionSet,
						}),
					],
					[] as string[],
				),
			],
			[] as string[],
		);
};

const selectCardId = (_: unknown, { cardId }: { cardId: string }) => cardId;

const createSelectSupportingArticles = () =>
	createShallowEqualResultSelector(
		selectCardsFromRootState,
		selectCardId,
		(cards, id) =>
			(cards[id].meta.supporting ? cards[id].meta.supporting! : []).map(
				(sId: string) => cards[sId],
			),
	);

const createSelectGroupArticles = () =>
	createShallowEqualResultSelector(
		selectGroupsFromRootState,
		selectCardsFromRootState,
		(_: any, { groupId }: { groupId: string }) => groupId,
		(groups, cards, groupId) =>
			(groups[groupId].cards || []).map((afId) => cards[afId]),
	);

const createSelectArticlesFromIds = () =>
	createShallowEqualResultSelector(
		selectCardsFromRootState,
		(_: any, { cardIds }: { cardIds: string[] }) => cardIds,
		(cards, cardIds) => (cardIds || []).map((afId: string) => cards[afId]),
	);

const createDemornalisedCard = (
	cardId: string,
	cards: { [id: string]: Card },
): CardDenormalised =>
	cards[cardId].meta && cards[cardId].meta.supporting
		? ({
				...cards[cardId],
				meta: {
					...cards[cardId].meta,
					supporting:
						cards[cardId].meta.supporting &&
						cards[cardId].meta.supporting!.map(
							(supportingCardId: string) => cards[supportingCardId],
						),
				},
			} as CardDenormalised)
		: { ...(cards[cardId] as CardDenormalised) };

// this creates a map between a group id and it's parent collection id
// { [groupId: string]: string /* collectionId */ }
const selectGroupCollectionMap = createSelector(
	collectionSelectors.selectAll,
	(collections: {
		[id: string]: Collection;
	}): {
		[id: string]: {
			cardSet: CardSets;
			collectionId: string;
		};
	} =>
		Object.values(collections).reduce(
			(mapAcc, collection) => ({
				...mapAcc,
				...(['live', 'draft', 'previously'] as CardSets[]).reduce(
					(stageAcc, stage) => ({
						...stageAcc,
						...(collection[stage] || []).reduce(
							(groupsAcc, groupId) => ({
								...groupsAcc,
								[groupId]: {
									collectionId: collection.id,
									cardSet: stage,
								},
							}),
							{},
						),
					}),
					{},
				),
			}),
			{},
		),
);

const selectGroupCollection = (state: State, groupId: string) => {
	const { collectionId, cardSet } = selectGroupCollectionMap(state)[groupId];
	const collection = collectionSelectors.selectById(state, collectionId);
	return { collection, cardSet };
};

const selectGroupSiblings = (state: State, groupId: string) => {
	const { collection, cardSet } = selectGroupCollection(state, groupId);
	if (!collection) {
		return [];
	}
	return (collection[cardSet] || []).map((id) => selectGroupMap(state)[id]);
};

const selectArticleGroup = (
	state: State,
	groupIdFromAction: string,
	cardId: string,
) => {
	const groups = selectGroupMap(state);
	const groupInAction = groups[groupIdFromAction];
	if (groupInAction && groupInAction.cards.includes(cardId)) {
		return groupIdFromAction;
	}

	const actualCardGroup = Object.values(groups).find(
		(group) => group && group.cards.includes(cardId),
	);

	return actualCardGroup && actualCardGroup.uuid;
};

const groupsArticleCount = (groups: Group[]) =>
	groups.reduce((acc, group) => acc + group.cards.length, 0);

const selectGroupSiblingsArticleCount = (state: State, groupId: string) =>
	groupsArticleCount(selectGroupSiblings(state, groupId));

const selectIndexInGroup = (state: State, groupId: string, articleId: string) =>
	selectGroupMap(state)[groupId].cards.indexOf(articleId);

const selectExternalArticleIdFromCard = (
	state: State,
	id: string,
): string | undefined => {
	const externalArticle = selectExternalArticleFromCard(state, id);

	if (!externalArticle) {
		return undefined;
	}

	return externalArticle.id;
};

const selectFronts = (state: State): FrontConfigMap =>
	frontsConfigSelectors.selectAll(state).fronts || {};

const selectFrontId = (_state: State, { frontId }: { frontId: string }) =>
	frontId;

const selectFront = createSelector(
	selectFronts,
	selectFrontId,
	(frontsConfigMap, frontId) => frontsConfigMap[frontId],
);

export {
	selectExternalArticleFromCard,
	createSelectArticleFromCard,
	selectCardsFromRootState,
	createSelectCardsInCollectionGroup,
	createSelectCardsInCollection,
	createSelectAllCardsInCollection,
	createSelectGroupArticles,
	createSelectSupportingArticles,
	createSelectCollection,
	createSelectCollectionStageGroups,
	createSelectPreviouslyLiveArticlesInCollection,
	createDemornalisedCard,
	selectCard,
	createSelectCollectionEditWarning,
	selectCardMap,
	selectGroupCollection,
	selectGroupSiblings,
	selectGroupSiblingsArticleCount,
	selectArticleTag,
	selectIndexInGroup,
	selectGroupMap,
	selectArticleGroup,
	groupsArticleCount,
	selectExternalArticleIdFromCard,
	selectCardHasMediaOverrides,
	createSelectArticlesFromIds,
	createSelectIsCardLive,
	selectSupportingArticleCount,
	selectFronts,
	selectFrontId,
	selectFront,
	selectCollectionMap,
};
