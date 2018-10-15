import omit from 'lodash/omit';
import { createSelector } from 'reselect';

import { getThumbnail } from 'util/CAPIUtils';
import { Overwrite } from 'utility-types';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import { ExternalArticle } from '../types/ExternalArticle';
import { DerivedArticle } from '../types/Article';
import {
  ArticleFragment,
  Collection,
  Group,
  Stages
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

const articleFromArticleFragmentSelector = (
  state: State,
  id: string
): DerivedArticle | void => {
  const externalArticle = externalArticleFromArticleFragmentSelector(state, id);
  const articleFragment = articleFragmentSelector(state, id);
  if (!externalArticle || !articleFragment) {
    return undefined;
  }

  return {
    ...omit(externalArticle, 'fields', 'frontsMeta'),
    ...externalArticle.fields,
    ...omit(articleFragment, 'meta'),
    ...articleFragment.meta,
    headline: articleFragment.meta.headline || externalArticle.fields.headline,
    trailText:
      articleFragment.meta.trailText || externalArticle.fields.trailText,
    byline: articleFragment.meta.byline || externalArticle.fields.byline,
    kicker: articleFragment.meta.customKicker || externalArticle.pillarName,
    tone: externalArticle.frontsMeta.tone,
    thumbnail: getThumbnail(articleFragment, externalArticle)
  };
};

const collectionIdSelector = (
  _: any,
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
            groups:
              collections[id].groups &&
              collections[id].groups!.slice().reverse()
          }
        : undefined
  );

const stageSelector = (
  _: any,
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
  _: any,
  { groupName }: { groupName: string; stage: Stages; collectionId: string }
) => groupName;

const createArticlesInCollectionGroupSelector = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  return createSelector(
    articleFragmentsSelector,
    collectionStageGroupsSelector,
    groupNameSelector,
    (articleFragments: any, collectionGroups, groupName: string) => {
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
    (articleFragments, collectionGroups) =>
      collectionGroups.reduce(
        (acc, group) => acc.concat(group.articleFragments),
        [] as string[]
      )
  );
};

const clipboardContentSelector = (state: State) => state.clipboard || [];

const articleFragmentIdSelector = (
  _: any,
  { articleFragmentId }: { articleFragmentId: string }
) => articleFragmentId;

const supportingArticlesSelector = createSelector(
  articleFragmentsFromRootStateSelector,
  articleFragmentIdSelector,
  (articleFragments, id) =>
    (articleFragments[id].meta.supporting || []).map(
      (sId: string) => articleFragments[sId]
    )
);

const groupArticlesSelector = createSelector(
  groupsFromRootStateSelector,
  articleFragmentsFromRootStateSelector,
  groupNameSelector,
  (groups, articleFragments, groupName) =>
    (groups[groupName].articleFragments || []).map(
      afId => articleFragments[afId]
    )
);

const clipboardArticlesSelector = createSelector(
  clipboardContentSelector,
  articleFragmentsFromRootStateSelector,
  (clipboard, articleFragments) =>
    clipboard.map((afId: string) => articleFragments[afId])
);

const collectionIdsSelector = (
  _: State,
  { collectionIds }: { collectionIds: string[] }
) => collectionIds;

const createNestedArticleFragment = (
  articleFragmentId: string,
  articleFragments: { [id: string]: ArticleFragment }
) =>
  articleFragments[articleFragmentId].meta &&
  articleFragments[articleFragmentId].meta.supporting
    ? {
        ...articleFragments[articleFragmentId],
        meta: {
          ...articleFragments[articleFragmentId].meta,
          supporting:
            articleFragments[articleFragmentId].meta.supporting &&
            // @todo -- odd result here, revisit
            (articleFragments[articleFragmentId].meta.supporting as any).map(
              (supportingFragmentId: string) =>
                articleFragments[supportingFragmentId]
            )
        }
      }
    : { ...articleFragments[articleFragmentId] };

const clipboardAsTreeSelector = createSelector(
  [clipboardContentSelector, articleFragmentsFromRootStateSelector],
  (clipboardContent, articleFragments): ClipboardTree => ({
    articleFragments: clipboardContent.map((fragmentId: string) =>
      createNestedArticleFragment(fragmentId, articleFragments)
    )
  })
);

const stageForTreeSelector = (
  _: any,
  { stage }: { stage: Stages; collectionIds: string[] }
): Stages => stage;

type FrontTree = {
  collections: CollectionTree[];
};

type CollectionTree = {
  id: string;
  groups: GroupTree[];
};

type GroupTree = Overwrite<
  Group,
  {
    articleFragments: ArticleFragmentTree[];
  }
>;

type ClipboardTree = {
  articleFragments: ArticleFragmentTree[];
};

type ArticleFragmentTree = Overwrite<
  ArticleFragment,
  {
    meta: Overwrite<
      ArticleFragment['meta'],
      {
        supporting?: SupportingTree[] | undefined;
      }
    >;
  }
>;

type SupportingTree = ArticleFragment;

const createCollectionsAsTreeSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    groupsSelector,
    articleFragmentsSelector,
    collectionIdsSelector,
    stageForTreeSelector,
    (
      collections,
      groups,
      articleFragments,
      collectionIds,
      stage
    ): FrontTree => ({
      collections: collectionIds
        .map(
          cId =>
            collections[cId] && {
              id: cId,
              groups: (collections[cId][stage] || []).map((gId: string) => ({
                ...groups[gId],
                articleFragments: (groups[gId].articleFragments || []).map(
                  articleFragmentId =>
                    createNestedArticleFragment(
                      articleFragmentId,
                      articleFragments
                    )
                )
              }))
            }
        )
        .filter(Boolean)
    })
  );

export {
  externalArticleFromArticleFragmentSelector,
  articleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createArticlesInCollectionSelector,
  groupArticlesSelector,
  clipboardArticlesSelector,
  supportingArticlesSelector,
  createCollectionSelector,
  selectSharedState,
  createCollectionsAsTreeSelector,
  articleFragmentSelector,
  clipboardAsTreeSelector,
  FrontTree,
  ClipboardTree,
  CollectionTree,
  GroupTree,
  ArticleFragmentTree,
  SupportingTree
};
