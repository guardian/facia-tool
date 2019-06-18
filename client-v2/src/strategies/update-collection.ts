import { State } from 'types/State';
import { updateCollection } from 'services/faciaApi';
import { updateEditionsCollection } from 'services/faciaApi';
import { runStrategy } from './run-strategy';
import { CollectionWithNestedArticles } from 'shared/types/Collection';
import { EditionsCollection } from 'types/Edition';

const collectionToEditionCollection = (
  col: CollectionWithNestedArticles
): EditionsCollection => {
  const { live, draft, isHidden, ...restCol } = col;
  return {
    ...restCol,
    isHidden: isHidden || false,
    items: draft || []
  };
};

const fetchCollectionsStrategy = (
  state: State,
  id: string,
  collection: CollectionWithNestedArticles
) =>
  runStrategy<void>(state, {
    front: () => updateCollection(id)(collection),
    edition: () =>
      updateEditionsCollection(id)(collectionToEditionCollection(collection)),
    none: () => null
  });

export { fetchCollectionsStrategy };
