import { reducer } from '../reducer';
import { pageViewDataReceivedAction } from '../actions';
import { PageViewStory } from '../../../../shared/types/PageViewData';

describe('Page view data reducer', () => {
  it('when data is received, it adds it to the store', () => {
    const data: PageViewStory[] = [
      {
        articleId: '123',
        articlePath: 'uk/news/a-story',
        totalHits: 2002,
        data: [
          {
            dateTime: 1238984989,
            count: 345
          },
          {
            dateTime: 1238985490,
            count: 895
          }
        ]
      }
    ];

    const expectedState = {
      frontId: 'frontId',
      collections: [
        {
          collectionId: 'collectionId',
          stories: data
        }
      ]
    };

    const action = pageViewDataReceivedAction(data, 'frontId', 'collectionId');
    const newState = reducer(undefined, action);
    expect(newState).toEqual(expectedState);
  });
});
