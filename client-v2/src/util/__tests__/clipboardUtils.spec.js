// @flow

import { draftArticle, articleWithSupportingLink } from 'fixtures/articles';
import { stateWithClipboard } from 'fixtures/clipboard';
import { normaliseClipboard, denormaliseClipboard } from '../clipboardUtils.js';

describe('Clipboard utilities', () => {
  describe('normaliseClipboard', () => {
    it('should normalise a clipboard with articles', () => {
      const result = normaliseClipboard({
        articles: [draftArticle, articleWithSupportingLink]
      });
      const { articleFragments } = result;
      const clipboardArticles = result.clipboard.articles;
      const supportingArticle =
        articleFragments[clipboardArticles[1]].meta.supporting[0];
      expect(clipboardArticles.length).toEqual(2);
      expect(Object.keys(articleFragments).length).toEqual(3);
      expect(articleFragments[clipboardArticles[0]].id).toBe('article/draft/1');
      expect(articleFragments[clipboardArticles[1]].id).toBe(
        'article/supporting/1'
      );
      expect(articleFragments[supportingArticle].id).toBe('article/live/0');
    });
  });

  describe('denormaliseClipboard', () => {
    it('should denormalise a clipboard from the application state', () => {
      const result = denormaliseClipboard(stateWithClipboard, 'clipboard');
      expect(result.articles[0].id).toEqual('article/live/0');
      expect(result.articles[1].id).toEqual('article/live/1');
      expect(result.articles[1].meta.supporting[0].id).toEqual(
        'article/live/3'
      );
    });
  });
});
