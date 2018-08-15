// @flow

import { liveArticle, articleWithSupporting } from 'shared/fixtures/shared';
import * as ArticleFragments from 'actions/ArticleFragments';
import * as Clipboard from 'actions/Clipboard';
import { stateWithClipboard } from 'fixtures/clipboard';
import {
  normaliseClipboard,
  denormaliseClipboard,
  getInsertActions,
  getMoveActions
} from '../clipboardUtils.js';

describe('Clipboard utilities', () => {
  describe('normaliseClipboard', () => {
    it('should normalise a clipboard with articles', () => {
      const result = normaliseClipboard({
        articles: [liveArticle, articleWithSupporting]
      });
      const { articleFragments } = result;
      const clipboardArticles = result.clipboard.articles;
      const supportingArticle =
        articleFragments[clipboardArticles[1]].meta.supporting[0];
      expect(clipboardArticles.length).toEqual(2);
      expect(Object.keys(articleFragments).length).toEqual(4);
      expect(articleFragments[clipboardArticles[0]].id).toBe('article/live/0');
      expect(articleFragments[clipboardArticles[1]].id).toBe('a/long/path/1');
      expect(articleFragments[supportingArticle].id).toBe('article/draft/2');
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

  describe('getInsertActions', () => {
    const emptyPayload = {
      id: 'id',
      path: {
        parent: {}
      }
    };

    it('should return correct actions when inserting supporting articleFragment', () => {
      const spy = jest.spyOn(
        ArticleFragments,
        'addSupportingArticleFragmentToClipboard'
      );

      const path = {
        path: {
          parent: {
            id: 'fragment',
            type: 'articleFragment'
          },
          index: 1
        }
      };

      const payload = { ...emptyPayload, ...path };
      getInsertActions({ payload });
      expect(spy).toBeCalledWith('fragment', 'id', 1);
    });

    it('should return correct actions when inserting article into clipboard', () => {
      const spy = jest.spyOn(Clipboard, 'addClipboardArticleFragment');

      const path = {
        path: {
          parent: {
            id: 'clipboard',
            type: 'clipboard'
          },
          index: 1
        }
      };

      const payload = { ...emptyPayload, ...path };
      getInsertActions({ payload });
      expect(spy).toBeCalledWith('id', 1);
    });
  });

  describe('getMoveActions', () => {
    const emptyPayload = {
      id: 'id',
      from: {
        parent: {}
      },
      to: {
        parent: {}
      }
    };

    it('should return correct from actions when dragging from article fragment', () => {
      const spy = jest.spyOn(
        ArticleFragments,
        'removeSupportingArticleFragmentFromClipboard'
      );

      const from = {
        from: {
          parent: {
            type: 'articleFragment',
            id: 'fragment'
          }
        }
      };

      const payload = { ...emptyPayload, ...from };
      getMoveActions({ payload });

      expect(spy).toBeCalledWith('fragment', 'id');
    });

    it('should return correct from actions when dragging from group', () => {
      const spy = jest.spyOn(Clipboard, 'removeClipboardArticleFragment');

      const from = {
        from: {
          parent: {
            type: 'clipboard',
            id: 'clipboard'
          }
        }
      };

      const payload = { ...emptyPayload, ...from };
      getMoveActions({ payload });

      expect(spy).toBeCalledWith('id');
    });

    it('should return correct actions when dragging to article fragment ', () => {
      const spy = jest.spyOn(
        ArticleFragments,
        'addSupportingArticleFragmentToClipboard'
      );

      const to = {
        to: {
          parent: {
            type: 'articleFragment',
            id: 'fragment'
          },
          index: 1
        }
      };

      const payload = { ...emptyPayload, ...to };
      getMoveActions({ payload });

      expect(spy).toBeCalledWith('fragment', 'id', 1);
    });

    it('should return correct actions when dragging to group ', () => {
      const spy = jest.spyOn(Clipboard, 'addClipboardArticleFragment');

      const to = {
        to: {
          parent: {
            type: 'clipboard',
            id: 'clipboard'
          },
          index: 1
        }
      };

      const payload = { ...emptyPayload, ...to };
      getMoveActions({ payload });

      expect(spy).toBeCalledWith('id', 1);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
