import omit from 'lodash/omit';
import { createSelector } from 'reselect';
import { getThumbnail, getPrimaryTag } from 'util/CAPIUtils';
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

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: any): State => rootState.shared;

const groupsSelector = (state: State): { [id: string]: Group } => state.groups;
const articleFragmentsSelector = (state: State) => state.articleFragments;

const articleFragmentsFromRootStateSelector = createSelector(
  [selectSharedState],
  (state: State) => articleFragmentsSelector(state)
);

const groupsFromRootStateSelector = createSelector(
  [selectSharedState],
  (state: State) => groupsSelector(state)
);

const articleFragmentSelector = (state: State, id: string): ArticleFragment =>
  state.articleFragments[id];

const externalArticleFromArticleFragmentSelector = (
  state: State,
  id: string
): ExternalArticle | void => {
  const articleFragment = articleFragmentSelector(state, id);
  const externalArticles = externalArticleSelectors.selectAll(state);
  if (!articleFragment) {
    return undefined;
  }
  return externalArticles[articleFragment.id];
};

const articleTagSelector = (state: State, id: string): ArticleTag => {
  const externalArticle = externalArticleFromArticleFragmentSelector(state, id);
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

const articleKickerSelector = (
  state: State,
  id: string
): string | undefined => {
  const articleFragment = articleFragmentSelector(state, id);

  if (!articleFragment) {
    return undefined;
  }

  const kickerOptions = articleTagSelector(state, id);
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

const createArticleFromArticleFragmentSelector = () =>
  createSelector(
    externalArticleFromArticleFragmentSelector,
    articleFragmentSelector,
    articleKickerSelector,
    (externalArticle, articleFragment, kicker) => {
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
        isLive:
          externalArticle && externalArticle.fields.isLive
            ? externalArticle.fields.isLive === 'true'
            : true,
        firstPublicationDate: externalArticle
          ? externalArticle.fields.firstPublicationDate
          : undefined,
        frontPublicationTime: articleFragment.frontPublicationDate
      };
    }
  );

const collectionIdSelector = (
  _: unknown,
  { collectionId }: { collectionId: string }
) => collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    collectionIdSelector,
    (collections: { [id: string]: Collection }, id: string) => collections[id]
  );

const stageSelector = (
  _: unknown,
  { collectionSet }: { collectionSet: CollectionItemSets; collectionId: string }
): CollectionItemSets => collectionSet;

const createCollectionStageGroupsSelector = () => {
  const collectionSelector = createCollectionSelector();
  return createShallowEqualResultSelector(
    collectionSelector,
    groupsSelector,
    stageSelector,
    (
      collection: Collection | void,
      groups: { [id: string]: Group },
      stage: CollectionItemSets
    ): Group[] =>
      ((collection && collection[stage]) || []).map(id => groups[id])
  );
};

const createCollectionEditWarningSelector = () => {
  const collectionSelector = createCollectionSelector();
  return createSelector(
    collectionSelector,
    (collection: Collection | void): boolean =>
      !!(
        collection &&
        collection.frontsToolSettings &&
        collection.frontsToolSettings.displayEditWarning
      )
  );
};

const groupNameSelector = (
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

const includeSupportingArticlesSelector = (
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

const createArticlesInCollectionGroupSelector = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  return createSelector(
    articleFragmentsSelector,
    collectionStageGroupsSelector,
    groupNameSelector,
    includeSupportingArticlesSelector,
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

const createArticlesInCollectionSelector = () => {
  const selectArticlesInCollectionGroups = createArticlesInCollectionGroupSelector();
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

const createAllArticlesInCollectionSelector = () => {
  const articlesInCollection = createArticlesInCollectionSelector();

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

const articleFragmentIdSelector = (
  _: unknown,
  { articleFragmentId }: { articleFragmentId: string }
) => articleFragmentId;

const createSupportingArticlesSelector = () =>
  createSelector(
    articleFragmentsFromRootStateSelector,
    articleFragmentIdSelector,
    (articleFragments, id) =>
      (articleFragments[id].meta.supporting
        ? articleFragments[id].meta.supporting!
        : []
      ).map((sId: string) => articleFragments[sId])
  );

const createGroupArticlesSelector = () =>
  createShallowEqualResultSelector(
    groupsFromRootStateSelector,
    articleFragmentsFromRootStateSelector,
    (_: any, { groupId }: { groupId: string }) => groupId,
    (groups, articleFragments, groupId) =>
      (groups[groupId].articleFragments || []).map(
        afId => articleFragments[afId]
      )
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
const groupCollectionMapSelector = createSelector(
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

const groupCollectionSelector = (state: State, groupId: string) => {
  const { collectionId, collectionItemSet } = groupCollectionMapSelector(state)[
    groupId
  ];
  const collection = collectionSelectors.selectById(state, collectionId);
  return { collection, collectionItemSet };
};

const groupSiblingsSelector = (state: State, groupId: string) => {
  const { collection, collectionItemSet } = groupCollectionSelector(
    state,
    groupId
  );
  if (!collection) {
    return [];
  }
  return (collection[collectionItemSet] || []).map(
    id => groupsSelector(state)[id]
  );
};

const groupSiblingsArticleCountSelector = (state: State, groupId: string) =>
  groupSiblingsSelector(state, groupId).reduce(
    (acc, group) => acc + group.articleFragments.length,
    0
  );

const indexInGroupSelector = (
  state: State,
  groupId: string,
  articleId: string
) => groupsSelector(state)[groupId].articleFragments.indexOf(articleId);

const externalArticleIdFromArticleFragmentSelector = (
  state: State,
  id: string
): string | undefined => {
  const externalArticle = externalArticleFromArticleFragmentSelector(state, id);

  if (!externalArticle) {
    return undefined;
  }

  return externalArticle.id;
};

export {
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  articleFragmentsFromRootStateSelector,
  createArticlesInCollectionGroupSelector,
  createArticlesInCollectionSelector,
  createAllArticlesInCollectionSelector,
  createGroupArticlesSelector,
  createSupportingArticlesSelector,
  createCollectionSelector,
  createCollectionStageGroupsSelector,
  createDemornalisedArticleFragment,
  selectSharedState,
  articleFragmentSelector,
  createCollectionEditWarningSelector,
  articleFragmentsSelector,
  groupCollectionSelector,
  groupSiblingsSelector,
  groupSiblingsArticleCountSelector,
  articleTagSelector,
  indexInGroupSelector,
  groupsSelector,
  externalArticleIdFromArticleFragmentSelector
};
