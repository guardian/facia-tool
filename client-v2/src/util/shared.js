// @flow

import v4 from 'uuid/v4';
import { omit } from 'lodash';

import {
  type CollectionWithNestedArticles,
  type Collection,
  type ArticleFragment
} from '../types/Shared';

const normaliseCollectionWithNestedArticles = (
  collection: CollectionWithNestedArticles
) => {
  const stages = ['live', 'draft', 'previously'];

  const idMap = stages.reduce(
    (acc, currentStage) => ({
      ...acc,
      [currentStage]:
        collection[currentStage] && collection[currentStage].map(() => v4())
    }),
    {}
  );

  const articleFragments = stages.reduce(
    (allArticleFragments, currentStage) => {
      const articleFragmentsInStage =
        collection[currentStage] &&
        collection[currentStage].map((articleFragment, index) =>
          Object.assign({}, articleFragment, {
            uuid: idMap[currentStage] && idMap[currentStage][index],
            id: articleFragment.id.split('/')[2] // @todo -- Reetta, is this in the right place?
          })
        );
      const fragmentsAsObjects: { [string]: ArticleFragment } = (
        articleFragmentsInStage || []
      ).reduce(
        (acc, articleFragment) => ({
          ...acc,
          [articleFragment.uuid]: articleFragment
        }),
        {}
      );
      return {
        ...allArticleFragments,
        ...fragmentsAsObjects
      };
    },
    {}
  );

  const collectionWithIds: Collection = Object.assign(
    {},
    omit(collection, ...stages),
    {
      articles: idMap
    }
  );

  return {
    collection: collectionWithIds,
    articleFragments
  };
};

export { normaliseCollectionWithNestedArticles };
