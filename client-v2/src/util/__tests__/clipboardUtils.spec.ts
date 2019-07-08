import { liveArticle, articleWithSupporting } from 'shared/fixtures/shared';
import { stateWithClipboard } from 'fixtures/clipboard';
import { normaliseClipboard, denormaliseClipboard } from '../clipboardUtils';

describe('Clipboard utilities', () => {
  describe('normaliseClipboard', () => {
    it('should normalise a clipboard with articles', () => {
      const result = normaliseClipboard({
        frontsClipboard: [liveArticle, articleWithSupporting],
        editionsClipboard: []
      });
      const { articleFragments } = result;
      const frontsClipboardArticles = result.frontsClipboard;
      const supportingArticle = articleFragments[frontsClipboardArticles[1]]
        .meta.supporting![0];
      expect(frontsClipboardArticles.length).toEqual(2);
      expect(Object.keys(articleFragments).length).toEqual(4);
      expect(articleFragments[frontsClipboardArticles[0]].id).toBe(
        'article/live/0'
      );
      expect(articleFragments[frontsClipboardArticles[1]].id).toBe(
        'a/long/path/1'
      );
      expect(articleFragments[supportingArticle].id).toBe('article/draft/2');
    });
  });

  describe('denormaliseClipboard', () => {
    it('should denormalise a clipboard from the application state', () => {
      const result = denormaliseClipboard(stateWithClipboard as any);
      expect(result.frontsClipboard[0].id).toEqual('article/live/0');
      expect(result.frontsClipboard[1].id).toEqual('article/live/1');
      expect(result.frontsClipboard[1].meta.supporting![0].id).toEqual(
        'article/live/3'
      );
      expect(result.editionsClipboard[0].id).toEqual('article/live/3');
    });
  });
});
