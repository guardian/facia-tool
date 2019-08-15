import { selectPageViewDataForCollection } from '../selectors';
import { State } from '../../../../types/State';
import initialState from '../../../../fixtures/initialState';

describe('selectors for page view data', () => {
  const state: State = {
    ...initialState,
    shared: {
      ...initialState.shared,
      pageViewData: [
        {
          frontId: 'frontId-1',
          collections: [
            { collectionId: 'collectionId-1', stories: [] },
            {
              collectionId: 'collectionId-2',
              stories: [
                {
                  articleId: 'articleId-1',
                  articlePath: 'uk/great/story',
                  totalHits: 99,
                  data: []
                },
                {
                  articleId: 'articleId-2',
                  articlePath: 'uk/greater/story',
                  totalHits: 200,
                  data: []
                }
              ]
            }
          ]
        }
      ]
    }
  };

  const expectedCollection = {
    collectionId: 'collectionId-2',
    stories: [
      {
        articleId: 'articleId-1',
        articlePath: 'uk/great/story',
        totalHits: 99,
        data: []
      },
      {
        articleId: 'articleId-2',
        articlePath: 'uk/greater/story',
        totalHits: 200,
        data: []
      }
    ]
  };

  it('gets the page view data for a given collection', () => {
    expect(
      selectPageViewDataForCollection(state, 'collectionId-2', 'frontId-1')
    ).toEqual(expectedCollection);
  });
});
