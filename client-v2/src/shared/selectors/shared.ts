import omit from 'lodash/omit';
import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';
import { getThumbnail, getPrimaryTag } from 'util/CAPIUtils';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import { ExternalArticle } from '../types/ExternalArticle';
import {
  ArticleFragment,
  Collection,
  Group,
  Stages,
  ArticleFragmentDenormalised
} from '../types/Collection';
import { State } from '../types/State';

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

const createArticleFromArticleFragmentSelector = () =>
  createSelector(
    externalArticleFromArticleFragmentSelector,
    articleFragmentSelector,
    (externalArticle, articleFragment) => {
      if (!externalArticle || !articleFragment) {
        return undefined;
      }

      return {
        ...omit(externalArticle, 'fields', 'frontsMeta'),
        ...externalArticle.fields,
        ...omit(articleFragment, 'meta'),
        ...articleFragment.meta,
        headline:
          articleFragment.meta.headline || externalArticle.fields.headline,
        trailText:
          articleFragment.meta.trailText || externalArticle.fields.trailText,
        byline: articleFragment.meta.byline || externalArticle.fields.byline,
        kicker: articleFragment.meta.customKicker || externalArticle.pillarName,
        tone: externalArticle.frontsMeta.tone,
        thumbnail: getThumbnail(articleFragment, externalArticle),
        isLive: externalArticle.fields.isLive === 'true',
        firstPublicationDate: externalArticle.fields.firstPublicationDate
      };
    }
  );

const articleKickerOptionsSelector = (state: State, id: string): string[] => {
  const externalArticle = externalArticleFromArticleFragmentSelector(state, id);
  if (!externalArticle) {
    return [];
  }

  const filterNulls = <T>(s: T | null | undefined): s is T => !!s;

  const tag = getPrimaryTag(externalArticle) || {
    webTitle: null,
    sectionName: null
  };

  return uniq([tag.webTitle, tag.sectionName].filter(filterNulls));
};

const collectionIdSelector = (
  _: unknown,
  { collectionId }: { collectionId: string }
) => collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    collectionIdSelector,
    (collections: { [id: string]: Collection }, id: string) =>
      collections[id]
        ? {
            ...collections[id],
            groups: collections[id].groups
          }
        : undefined
  );

const stageSelector = (
  _: unknown,
  { stage }: { stage: Stages; collectionId: string }
): Stages => stage;

const createCollectionStageGroupsSelector = () => {
  const collectionSelector = createCollectionSelector();
  return createSelector(
    collectionSelector,
    groupsSelector,
    stageSelector,
    (
      collection: Collection | void,
      groups: { [id: string]: Group },
      stage: Stages
    ): Group[] =>
      ((collection && collection[stage]) || []).map(id => groups[id])
  );
};

const groupNameSelector = (
  _: unknown,
  { groupName }: { groupName: string; stage: Stages; collectionId: string }
) => groupName;

const createArticlesInCollectionGroupSelector = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  return createSelector(
    articleFragmentsSelector,
    collectionStageGroupsSelector,
    groupNameSelector,
    (_, collectionGroups, groupName) => {
      const group = collectionGroups.find(({ id }) => id === groupName) || {
        articleFragments: []
      };
      return group.articleFragments || [];
    }
  );
};

const createArticlesInCollectionSelector = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  return createSelector(
    articleFragmentsSelector,
    collectionStageGroupsSelector,
    (_, collectionGroups) =>
      collectionGroups.reduce(
        (acc, group) => acc.concat(group.articleFragments),
        [] as string[]
      )
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
  createSelector(
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

export {
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  articleFragmentsFromRootStateSelector,
  createArticlesInCollectionGroupSelector,
  createArticlesInCollectionSelector,
  createGroupArticlesSelector,
  createSupportingArticlesSelector,
  createCollectionSelector,
  createCollectionStageGroupsSelector,
  createDemornalisedArticleFragment,
  selectSharedState,
  articleFragmentSelector,
  articleKickerOptionsSelector
};
