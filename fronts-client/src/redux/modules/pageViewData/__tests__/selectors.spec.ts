import { selectDataForArticle } from '../selectors';
import { state as pageViewData, data } from './fixtures';
import globalState from '../../../../fixtures/initialState';
import { State } from 'types/State';

const state = {
  ...globalState,
    pageViewData
} as State;

describe('selectors', () => {
  describe('selectDataForArticle', () => {
    it('should select page view data for an article', () => {
      const result = selectDataForArticle(
        state,
        'articleId',
        'collectionId',
        'frontId'
      );
      expect(result).toBe(data);
    });
    it('should handle missing article data', () => {
      const result = selectDataForArticle(
        state,
        'invalidArticleId',
        'collectionId',
        'frontId'
      );
      expect(result).toBe(undefined);
    });
    it('should handle missing collection data', () => {
      const result = selectDataForArticle(
        state,
        'invalidArticleId',
        'invalidCollectionId',
        'frontId'
      );
      expect(result).toBe(undefined);
    });
    it('should handle missing front data', () => {
      const result = selectDataForArticle(
        state,
        'invalidArticleId',
        'invalidCollectionId',
        'invalidFrontId'
      );
      expect(result).toBe(undefined);
    });
  });
});
