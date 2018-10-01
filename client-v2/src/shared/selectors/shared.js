// @flow

import { createSelector } from 'reselect';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';

import type { ArticleFragment } from '../types/Collection';
import type { State } from '../types/State';

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: any): State => rootState.shared;

const groupsSelector = (state: State) => state.groups;
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
) => {
  const articleFragment = articleFragmentSelector(state, id);
  const externalArticles = externalArticleSelectors.selectAll(state);
  if (!articleFragment) {
    return null;
  }
  return externalArticles[articleFragment.id] || null;
};

const collectionIdSelector = (_, { collectionId }: { collectionId: string }) =>
  collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    collectionIdSelector,
    (collections, id) =>
      collections[id]
        ? {
            ...collections[id],
            groups:
              collections[id].groups && collections[id].groups.slice().reverse()
          }
        : false
  );

const stageSelector = (_, { stage }: { stage: string }) => stage;

const createCollectionStageGroupsSelector = () => {
  const collectionSelector = createCollectionSelector();
  return createSelector(
    collectionSelector,
    groupsSelector,
    stageSelector,
    (collection, groups, stage) =>
      (collection[stage] || []).map(id => groups[id])
  );
};

const groupNameSelector = (_, { groupName }: { groupName: string }) =>
  groupName;

const createArticlesInCollectionGroupSelector = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  return createSelector(
    articleFragmentsSelector,
    collectionStageGroupsSelector,
    groupNameSelector,
    (articleFragments, collectionGroups, groupName) => {
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
        []
      )
  );
};

const clipboardContentSelector = state => state.clipboard || [];

const articleFragmentIdSelector = (
  _,
  { articleFragmentId }: { articleFragmentId: string }
) => articleFragmentId;

const supportingArticlesSelector = createSelector(
  articleFragmentsFromRootStateSelector,
  articleFragmentIdSelector,
  (articleFragments, id) =>
    (articleFragments[id].meta.supporting || []).map(
      sId => articleFragments[sId]
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
  (clipboard, articleFragments) => clipboard.map(afId => articleFragments[afId])
);

const collectionIdsSelector = (
  state,
  { collectionIds }: { collectionIds: string[] }
) => collectionIds;

const createNestedArticleFragment = (
  articleFragmentId: string,
  articleFragments: { [string]: ArticleFragment }
) =>
  articleFragments[articleFragmentId].meta &&
  articleFragments[articleFragmentId].meta.supporting
    ? {
        ...articleFragments[articleFragmentId],
        meta: {
          ...articleFragments[articleFragmentId].meta,
          supporting: articleFragments[articleFragmentId].meta.supporting.map(
            (supportingFragmentId: string) =>
              articleFragments[supportingFragmentId]
          )
        }
      }
    : { ...articleFragments[articleFragmentId] };

const clipboardAsTreeSelector = createSelector(
  [clipboardContentSelector, articleFragmentsFromRootStateSelector],
  (clipboardContent, articleFragments) => {
    if (clipboardContent.length === 0) {
      return {};
    }

    return {
      articleFragments: clipboardContent.map(fragmentId =>
        createNestedArticleFragment(fragmentId, articleFragments)
      )
    };
  }
);

const createCollectionsAsTreeSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    groupsSelector,
    articleFragmentsSelector,
    collectionIdsSelector,
    stageSelector,
    (collections, groups, articleFragments, collectionIds, stage) => ({
      collections: collectionIds
        .map(
          cId =>
            collections[cId] && {
              id: cId,
              groups: (collections[cId][stage] || []).map(gId => ({
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
  createArticlesInCollectionGroupSelector,
  createArticlesInCollectionSelector,
  groupArticlesSelector,
  clipboardArticlesSelector,
  supportingArticlesSelector,
  createCollectionSelector,
  selectSharedState,
  createCollectionsAsTreeSelector,
  articleFragmentSelector,
  clipboardAsTreeSelector
};
