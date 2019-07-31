import omit from 'lodash/omit';
import { createSelector } from 'reselect';
import {
  getThumbnail,
  getPrimaryTag,
  getContributorImage
} from 'util/CAPIUtils';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import { ExternalArticle } from '../types/ExternalArticle';
import {
  ArticleFragment,
  Collection,
  Group,
  CollectionItemSets,
  ArticleFragmentDenormalised,
  ArticleTag
} from '../types/Collection';
import { State } from '../types/State';
import { collectionItemSets } from 'constants/fronts';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';
import { DerivedArticle } from 'shared/types/Article';

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: any): State => rootState.shared;

const selectGroups = (state: State): { [id: string]: Group } => state.groups;
const selectArticleFragments = (state: State) => state.articleFragments;

const selectArticleFragmentsFromRootState = createSelector(
  [selectSharedState],
  (state: State) => selectArticleFragments(state)
);

const selectGroupsFromRootState = createSelector(
  [selectSharedState],
  (state: State) => selectGroups(state)
);

const selectArticleFragment = (state: State, id: string): ArticleFragment =>
  state.articleFragments[id];

const selectExternalArticleFromArticleFragment = (
  state: State,
  id: string
): ExternalArticle | void => {
  const articleFragment = selectArticleFragment(state, id);
  const externalArticles = externalArticleSelectors.selectAll(state);
  if (!articleFragment) {
    return undefined;
  }
  return externalArticles[articleFragment.id];
};

const selectArticleTag = (state: State, id: string): ArticleTag => {
  const externalArticle = selectExternalArticleFromArticleFragment(state, id);
  const emptyTag = {
    webTitle: undefined,
    sectionName: undefined
  };

  if (!externalArticle) {
    return emptyTag;
  }

  const tag = getPrimaryTag(externalArticle);

  if (tag) {
    return {
      webTitle: tag.webTitle,
      sectionName: tag.sectionName
    };
  }
  return emptyTag;
};

const selectArticleKicker = (state: State, id: string): string | undefined => {
  const articleFragment = selectArticleFragment(state, id);

  if (!articleFragment) {
    return undefined;
  }

  const kickerOptions = selectArticleTag(state, id);
  const meta = articleFragment.meta;

  if (!articleFragment) {
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

const selectCollectionItemHasMediaOverrides = (state: State, id: string) => {
  const article = selectArticleFragment(state, id);
  return (
    !!article &&
    !!article.meta &&
    (!!article.meta.imageCutoutReplace ||
      !!article.meta.imageReplace ||
      !!article.meta.imageSlideshowReplace)
  );
};

const createSelectArticleFromArticleFragment = () =>
  createSelector(
    selectExternalArticleFromArticleFragment,
    selectArticleFragment,
    selectArticleKicker,
    (externalArticle, articleFragment, kicker): DerivedArticle | undefined => {
      if (!articleFragment) {
        return undefined;
      }

      const articleMeta = externalArticle
        ? { ...externalArticle.frontsMeta.defaults, ...articleFragment.meta }
        : articleFragment.meta;

      return {
        ...omit(externalArticle || {}, 'fields', 'frontsMeta'),
        ...(externalArticle ? externalArticle.fields : {}),
        ...omit(articleFragment, 'meta'),
        ...articleMeta,
        headline:
          articleFragment.meta.headline ||
          (externalArticle ? externalArticle.fields.headline : undefined),
        trailText:
          articleFragment.meta.trailText ||
          (externalArticle ? externalArticle.fields.trailText : undefined),
        byline:
          articleFragment.meta.byline ||
          (externalArticle ? externalArticle.fields.byline : undefined),
        kicker,
        pillarId: externalArticle ? externalArticle.pillarId : undefined,
        thumbnail: externalArticle
          ? getThumbnail(externalArticle, articleMeta)
          : undefined,
        cutoutThumbnail: externalArticle
          ? getContributorImage(externalArticle)
          : undefined,
        isLive:
          externalArticle && externalArticle.fields.isLive
            ? externalArticle.fields.isLive === 'true'
            : true,
        firstPublicationDate: externalArticle
          ? externalArticle.fields.firstPublicationDate
          : undefined,
        frontPublicationDate: articleFragment.frontPublicationDate
      };
    }
  );

const selectCollectionId = (
  _: unknown,
  { collectionId }: { collectionId: string }
) => collectionId;

const createSelectCollection = () =>
  createSelector(
    collectionSelectors.selectAll,
    selectCollectionId,
    (collections: { [id: string]: Collection }, id: string) => collections[id]
  );

const selectStage = (
  _: unknown,
  { collectionSet }: { collectionSet: CollectionItemSets; collectionId: string }
): CollectionItemSets => collectionSet;

const createSelectCollectionStageGroups = () => {
  const selectCollection = createSelectCollection();
  return createShallowEqualResultSelector(
    selectCollection,
    selectGroups,
    selectStage,
    (
      collection: Collection | void,
      groups: { [id: string]: Group },
      stage: CollectionItemSets
    ): Group[] => {
      const grps = ((collection && collection[stage]) || []).map(
        id => groups[id]
      );
      if (grps.length < 2) {
        return grps;
      }

      // Groups without names and ids are groups which no longer exist in the config because
      // the collection layout has changed. We need to collect the article fragments in these
      // groups and display them in the top group.
      const orphanedFragments: string[] = grps
        .filter(grp => !grp.name && grp.id)
        .reduce((frags: string[], g) => frags.concat(g.articleFragments), []);

      // The final array of groups consist of groups where all groups without names but with ids
      // are filtered out as these groups no longer exist in the config of the collection.
      const finalGroups = grps.filter(grp => grp.name || !grp.id);
      if (finalGroups.length > 0) {
        const originalFirstGroupFragments = finalGroups[0].articleFragments;
        const firstGroupFragments = orphanedFragments.concat(
          originalFirstGroupFragments
        );
        const firstGroup = {
          ...finalGroups[0],
          ...{ articleFragments: firstGroupFragments }
        };
        finalGroups[0] = firstGroup;
      }
      return finalGroups;
    }
  );
};

const createSelectFivePreviouslyLiveArticlesInCollection = () => {
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
      articleFragments: (
        (collection && collection.previouslyArticleFragmentIds) ||
        []
      ).slice(0, 5)
    })
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
      )
  );
};

const selectGroupName = (
  _: unknown,
  {
    groupName
  }: {
    groupName?: string;
    includeSupportingArticles?: boolean;
    collectionSet: CollectionItemSets;
    collectionId: string;
  }
) => groupName;

const selectIncludeSupportingArticles = (
  _: unknown,
  {
    includeSupportingArticles
  }: {
    groupName?: string;
    includeSupportingArticles?: boolean;
    collectionSet: CollectionItemSets;
    collectionId: string;
  }
) => includeSupportingArticles;

const createSelectArticlesInCollectionGroup = () => {
  const selectCollectionStageGroups = createSelectCollectionStageGroups();
  return createShallowEqualResultSelector(
    selectArticleFragments,
    selectCollectionStageGroups,
    selectGroupName,
    selectIncludeSupportingArticles,
    (
      articleFragments,
      collectionGroups,
      groupName,
      includeSupportingArticles = true
    ) => {
      const groups = groupName
        ? [
            collectionGroups.find(({ id }) => id === groupName) || {
              articleFragments: []
            }
          ]
        : collectionGroups;
      const groupArticleFragmentIds = groups.reduce(
        (acc, group) => acc.concat(group.articleFragments || []),
        [] as string[]
      );
      if (!includeSupportingArticles) {
        return groupArticleFragmentIds;
      }
      return groupArticleFragmentIds.reduce(
        (acc, id) => {
          const articleFragment = articleFragments[id];
          if (
            !articleFragment ||
            !articleFragment.meta ||
            !articleFragment.meta.supporting ||
            !articleFragment.meta.supporting.length
          ) {
            return acc.concat(id);
          }
          return acc.concat(id, articleFragment.meta.supporting);
        },
        [] as string[]
      );
    }
  );
};

const createSelectArticlesInCollection = () => {
  const selectArticlesInCollectionGroups = createSelectArticlesInCollectionGroup();
  return (
    state: State,
    {
      collectionId,
      collectionSet,
      includeSupportingArticles = true
    }: {
      collectionId: string;
      collectionSet: CollectionItemSets;
      includeSupportingArticles?: boolean;
    }
  ) =>
    selectArticlesInCollectionGroups(state, {
      collectionId,
      collectionSet,
      includeSupportingArticles
    });
};

const createSelectAllArticlesInCollection = () => {
  const articlesInCollection = createSelectArticlesInCollection();

  return (state: State, collectionIds: string[]) =>
    collectionIds.reduce(
      (acc, id) => [
        ...acc,
        ...Object.values(collectionItemSets).reduce(
          (acc1, collectionSet) => [
            ...acc1,
            ...articlesInCollection(state, {
              collectionId: id,
              collectionSet
            })
          ],
          [] as string[]
        )
      ],
      [] as string[]
    );
};

const selectArticleFragmentId = (
  _: unknown,
  { articleFragmentId }: { articleFragmentId: string }
) => articleFragmentId;

const createSelectSupportingArticles = () =>
  createShallowEqualResultSelector(
    selectArticleFragmentsFromRootState,
    selectArticleFragmentId,
    (articleFragments, id) =>
      (articleFragments[id].meta.supporting
        ? articleFragments[id].meta.supporting!
        : []
      ).map((sId: string) => articleFragments[sId])
  );

const createSelectGroupArticles = () =>
  createShallowEqualResultSelector(
    selectGroupsFromRootState,
    selectArticleFragmentsFromRootState,
    (_: any, { groupId }: { groupId: string }) => groupId,
    (groups, articleFragments, groupId) =>
      (groups[groupId].articleFragments || []).map(
        afId => articleFragments[afId]
      )
  );

const createSelectArticlesFromIds = () =>
  createShallowEqualResultSelector(
    selectArticleFragmentsFromRootState,
    (_: any, { articleFragmentIds }: { articleFragmentIds: string[] }) =>
      articleFragmentIds,
    (articleFragments, articleFragmentIds) =>
      (articleFragmentIds || []).map((afId: string) => articleFragments[afId])
  );

const createDemornalisedArticleFragment = (
  articleFragmentId: string,
  articleFragments: { [id: string]: ArticleFragment }
): ArticleFragmentDenormalised =>
  articleFragments[articleFragmentId].meta &&
  articleFragments[articleFragmentId].meta.supporting
    ? {
        ...articleFragments[articleFragmentId],
        meta: {
          ...articleFragments[articleFragmentId].meta,
          supporting:
            articleFragments[articleFragmentId].meta.supporting &&
            articleFragments[articleFragmentId].meta.supporting!.map(
              (supportingFragmentId: string) =>
                articleFragments[supportingFragmentId]
            )
        }
      }
    : { ...articleFragments[articleFragmentId] };

// this creates a map between a group id and it's parent collection id
// { [groupId: string]: string /* collectionId */ }
const selectGroupCollectionMap = createSelector(
  collectionSelectors.selectAll,
  (collections: {
    [id: string]: Collection;
  }): {
    [id: string]: {
      collectionItemSet: CollectionItemSets;
      collectionId: string;
    };
  } =>
    Object.values(collections).reduce(
      (mapAcc, collection) => ({
        ...mapAcc,
        ...(['live', 'draft', 'previously'] as CollectionItemSets[]).reduce(
          (stageAcc, stage) => ({
            ...stageAcc,
            ...(collection[stage] || []).reduce(
              (groupsAcc, groupId) => ({
                ...groupsAcc,
                [groupId]: {
                  collectionId: collection.id,
                  collectionItemSet: stage
                }
              }),
              {}
            )
          }),
          {}
        )
      }),
      {}
    )
);

const selectGroupCollection = (state: State, groupId: string) => {
  const { collectionId, collectionItemSet } = selectGroupCollectionMap(state)[
    groupId
  ];
  const collection = collectionSelectors.selectById(state, collectionId);
  return { collection, collectionItemSet };
};

const selectGroupSiblings = (state: State, groupId: string) => {
  const { collection, collectionItemSet } = selectGroupCollection(
    state,
    groupId
  );
  if (!collection) {
    return [];
  }
  return (collection[collectionItemSet] || []).map(
    id => selectGroups(state)[id]
  );
};

const selectArticleGroup = (
  state: State,
  groupIdFromAction: string,
  fragmentId: string
) => {
  const groups = selectGroups(state);
  const groupInAction = groups[groupIdFromAction];
  if (groupInAction && groupInAction.articleFragments.includes(fragmentId)) {
    return groupIdFromAction;
  }

  const actualFragmentGroup = Object.values(groups).find(
    group => group && group.articleFragments.includes(fragmentId)
  );

  return actualFragmentGroup && actualFragmentGroup.uuid;
};

const groupsArticleCount = (groups: Group[]) =>
  groups.reduce((acc, group) => acc + group.articleFragments.length, 0);

const selectGroupSiblingsArticleCount = (state: State, groupId: string) =>
  groupsArticleCount(selectGroupSiblings(state, groupId));

const selectIndexInGroup = (state: State, groupId: string, articleId: string) =>
  selectGroups(state)[groupId].articleFragments.indexOf(articleId);

const selectExternalArticleIdFromArticleFragment = (
  state: State,
  id: string
): string | undefined => {
  const externalArticle = selectExternalArticleFromArticleFragment(state, id);

  if (!externalArticle) {
    return undefined;
  }

  return externalArticle.id;
};

export {
  selectExternalArticleFromArticleFragment,
  createSelectArticleFromArticleFragment,
  selectArticleFragmentsFromRootState,
  createSelectArticlesInCollectionGroup,
  createSelectArticlesInCollection,
  createSelectAllArticlesInCollection,
  createSelectGroupArticles,
  createSelectSupportingArticles,
  createSelectCollection,
  createSelectCollectionStageGroups,
  createSelectFivePreviouslyLiveArticlesInCollection,
  createDemornalisedArticleFragment,
  selectSharedState,
  selectArticleFragment,
  createSelectCollectionEditWarning,
  selectArticleFragments,
  selectGroupCollection,
  selectGroupSiblings,
  selectGroupSiblingsArticleCount,
  selectArticleTag,
  selectIndexInGroup,
  selectGroups,
  selectArticleGroup,
  groupsArticleCount,
  selectExternalArticleIdFromArticleFragment,
  selectCollectionItemHasMediaOverrides,
  createSelectArticlesFromIds
};
