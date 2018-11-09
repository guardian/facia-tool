import { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import { CollectionWithNestedArticles, ArticleFragment } from 'shared/types/Collection';
import { detectPressFailureMs } from 'constants/fronts';
import { StoryDetails } from 'types/FaciaApi';

const getFrontCollections = (
  frontId: string|void,
  fronts: FrontConfig[],
  collections: { [id: string]: CollectionConfig }
): CollectionConfig[] => {
  if (!frontId) {
    return [];
  }
  const selectedFront: FrontConfig|void = fronts.find(
    (front: FrontConfig) => front.id === frontId
  );

  if (selectedFront) {
    return selectedFront.collections.map(
      collectionId => collections[collectionId]
    );
  }

  return [];
};

const combineCollectionWithConfig = (
  collectionConfig: CollectionConfig,
  collection: CollectionWithNestedArticles
): CollectionWithNestedArticles =>
  Object.assign({}, collection, {
    id: collection.id,
    displayName: collectionConfig.displayName,
    groups: collectionConfig.groups,
    type: collectionConfig.type
  });

const populateDraftArticles = (collection: CollectionWithNestedArticles) =>
  !collection.draft ? collection.live : collection.draft;

const isFrontStale = (lastUpdated?: number, lastPressed?: number) => {
  if (lastUpdated && lastPressed) {
    return lastUpdated - lastPressed > detectPressFailureMs;
  }
  return false;
};

const getVisibilityStoryDetails = (groupsWithStories: ArticleFragment[][]) => groupsWithStories.reduce((stories, storiesInGroup, index) => {
   const groupStories = storiesInGroup.map(story => ({ group: index, isBoosted: !!story.meta.isBoosted }));
    return stories.concat(groupStories);

  }, [] as StoryDetails[]);

export {
  getFrontCollections,
  combineCollectionWithConfig,
  populateDraftArticles,
  isFrontStale,
  getVisibilityStoryDetails
};
