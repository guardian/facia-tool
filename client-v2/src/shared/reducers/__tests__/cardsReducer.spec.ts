import reducer from '../cardsReducer';
import { updateCardMeta } from '../../actions/Cards';
import { stateWithClipboard } from 'fixtures/clipboard';

describe('cardsReducer', () => {
  it('should update the card meta', () => {
    expect(
      reducer(
        stateWithClipboard.shared.cards as any,
        updateCardMeta('article', {
          headline: 'headline'
        }),
        stateWithClipboard.shared
      ).article.meta
    ).toEqual({
      headline: 'headline'
    });
  });
  it('should overwrite properties', () => {
    expect(
      reducer(
        stateWithClipboard.shared.cards as any,
        updateCardMeta('article2', {
          headline: 'headline'
        }),
        stateWithClipboard.shared
      ).article2.meta
    ).toEqual({
      headline: 'headline'
    });
  });
  it('should merge properties if the merge flag is set', () => {
    expect(
      reducer(
        stateWithClipboard.shared.cards as any,
        updateCardMeta(
          'article2',
          {
            headline: 'headline'
          },
          { merge: true }
        ),
        stateWithClipboard.shared
      ).article2.meta
    ).toEqual({
      headline: 'headline',
      supporting: ['article3']
    });
  });
});
