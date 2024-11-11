import { liveArticle, articleWithSupporting } from 'fixtures/shared';
import { stateWithClipboard } from 'fixtures/clipboard';
import { normaliseClipboard, denormaliseClipboard } from '../clipboardUtils';

describe('Clipboard utilities', () => {
	describe('normaliseClipboard', () => {
		it('should normalise a clipboard with articles', () => {
			const result = normaliseClipboard({
				articles: [liveArticle, articleWithSupporting],
			});
			const { cards } = result;
			const clipboardArticles = result.clipboard.articles;
			const supportingArticle = cards[clipboardArticles[1]].meta.supporting![0];
			expect(clipboardArticles.length).toEqual(2);
			expect(Object.keys(cards).length).toEqual(4);
			expect(cards[clipboardArticles[0]].id).toBe('article/live/0');
			expect(cards[clipboardArticles[1]].id).toBe('a/long/path/1');
			expect(cards[supportingArticle].id).toBe('article/draft/2');
		});
	});

	describe('denormaliseClipboard', () => {
		it('should denormalise a clipboard from the application state', () => {
			const result = denormaliseClipboard(stateWithClipboard as any);
			expect(result.articles[0].id).toEqual('article/live/0');
			expect(result.articles[1].id).toEqual('article/live/1');
			expect(result.articles[1].meta.supporting![0].id).toEqual(
				'article/live/3',
			);
		});
	});
});
