import configureStore from 'util/configureStore';
import fetchMock from 'fetch-mock';
import initialState from 'fixtures/initialState';
import { initialiseFront } from 'actions/Fronts';
import { scJohnsonPartnerZoneCollection } from 'fixtures/collectionsEndpointResponse';
import { articlesForScJohnsonPartnerZone } from 'fixtures/capiEndpointResponse';
import { selectIsCollectionOpen } from 'bundles/frontsUIBundle';
import { selectArticlesInCollections } from 'shared/selectors/collection';
import {
  articleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';

describe('Fronts actions', () => {
  describe('initialiseFront', () => {
    afterEach(() => fetchMock.flush());
    it('should fetch all of the front collections, mark <n> first collections as open, and fetch articles for <n> first collections', async () => {
      fetchMock.once(
        '/collections?ids=e59785e9-ba82-48d8-b79a-0a80b2f9f808&ids=4ab657ff-c105-4292-af23-cda00457b6b7&ids=c7f48719-6cbc-4024-ae92-1b5f9f6c0c99',
        scJohnsonPartnerZoneCollection
      );
      fetchMock.post('begin:/stories-visible', {
        desktop: 2,
        mobile: 4
      });
      fetchMock.once(
        'begin:/api/preview/search?ids=internal-code/page/5607373,internal-code/page/5607569',
        articlesForScJohnsonPartnerZone
      );
      const store = configureStore(initialState);

      await store.dispatch(initialiseFront(
        'sc-johnson-partner-zone',
        'draft'
      ) as any);

      const state = store.getState();
      const sharedState = selectSharedState(state);
      const collectionIds = [
        'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
        '4ab657ff-c105-4292-af23-cda00457b6b7',
        'c7f48719-6cbc-4024-ae92-1b5f9f6c0c99'
      ];

      // The top three collections should be open
      expect(collectionIds.every(_ => selectIsCollectionOpen(state, _))).toBe(
        true
      );
      // The collections and articles should be fetched
      expect(
        selectArticlesInCollections(sharedState, {
          collectionIds,
          itemSet: 'draft'
        }).every(_ => !!articleFragmentSelector(sharedState, _))
      ).toBe(true);
    });
  });
});
