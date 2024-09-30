import { capiArticleWithElementsThumbnail } from 'fixtures/capiArticle';
import { cardMeta, cardWithSlideshowThumbnailMeta } from 'fixtures/card';
import {
	getIdFromURL,
	getContributorImage,
	getThumbnail,
	isLive,
} from 'util/CAPIUtils';
import { CapiArticle } from 'types/Capi';

describe('CAPIUtils', () => {
	describe('getIdFromURL', () => {
		it('should return correct path if url is from guardian website', () => {
			const url = 'https://www.theguardian.com/business/2015/example';
			expect(getIdFromURL(url)).toEqual('business/2015/example');
		});
		it('should return correct path if url is from guardian website /live section', () => {
			const url = 'https://www.theguardian.com/live/business/2015/example';
			expect(getIdFromURL(url)).toEqual('live/business/2015/example');
		});
		it('should return correct path if url is from viewer', () => {
			const url = 'https://viewer.gutools.co.uk/business/2015/example';
			expect(getIdFromURL(url)).toEqual('business/2015/example');
		});
		it('should return correct path if url is from viewer preview', () => {
			const url = 'https://viewer.gutools.co.uk/preview/business/2015/example';
			expect(getIdFromURL(url)).toEqual('business/2015/example');
		});
		it('should return correct path if url is from viewer live', () => {
			const url = 'https://viewer.gutools.co.uk/live/business/2015/example';
			expect(getIdFromURL(url)).toEqual('business/2015/example');
		});
		it('should return correct path if url is from viewer live', () => {
			const url =
				'https://viewer.gutools.co.uk/live/live/business/2015/example';
			expect(getIdFromURL(url)).toEqual('live/business/2015/example');
		});
		it('should return correct path if url is for gu.com', () => {
			const url = 'https://gu.com/business/2015/example';
			expect(getIdFromURL(url)).toEqual('business/2015/example');
		});
	});

	describe('getContributorImage', () => {
		it('should get a contributor image from an external article', () => {
			expect(getContributorImage(capiArticleWithElementsThumbnail)).toEqual(
				undefined,
			);
		});
	});

	describe('getThumbnail', () => {
		it('should get a thumbnail from article elements', () => {
			expect(getThumbnail(cardMeta, capiArticleWithElementsThumbnail)).toEqual(
				'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg',
			);
		});
		it('should get a thumbnail from cardMeta slideshows if imageSlideshowReplace is true', () => {
			expect(
				getThumbnail(
					cardWithSlideshowThumbnailMeta,
					capiArticleWithElementsThumbnail,
				),
			).toEqual('exampleSrc1');
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageSlideshowReplace: false,
					},
					capiArticleWithElementsThumbnail,
				),
			).toEqual(
				'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg',
			);
		});
		it('should get a thumbnail from the fields thumbnail/secureThumbnail if meta.imageCutoutReplace is true', () => {
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageCutoutReplace: true,
					},
					{
						...capiArticleWithElementsThumbnail,
						fields: {
							...capiArticleWithElementsThumbnail.fields,
							thumbnail: 'fieldSrc',
						},
					},
				),
			).toEqual('fieldSrc');
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageCutoutReplace: true,
					},
					{
						...capiArticleWithElementsThumbnail,
						fields: {
							...capiArticleWithElementsThumbnail.fields,
							thumbnail: 'fieldSrc',
							secureThumbnail: 'fieldSrcSecure',
						},
					},
				),
			).toEqual('fieldSrcSecure');
		});
		it('should get a thumbnail from the contributor image if meta.imageCutoutReplace is true', () => {
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageCutoutReplace: true,
					},
					{
						...capiArticleWithElementsThumbnail,
						tags: [
							{
								type: 'contributor',
								bylineLargeImageUrl: 'contributorSrc',
							},
						],
					} as any,
				),
			).toEqual('contributorSrc');
		});
		it('should get a thumbnail from the meta cutout if meta.imageCutoutReplace is true', () => {
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageCutoutReplace: true,
						imageCutoutSrc: 'imageCutoutSrc',
					},
					{
						...capiArticleWithElementsThumbnail,
						tags: [
							{
								type: 'contributor',
								bylineLargeImageUrl: 'contributorSrc',
							},
						],
						fields: {
							...capiArticleWithElementsThumbnail.fields,
							thumbnail: 'fieldSrc',
							secureThumbnail: 'fieldSrcSecure',
						},
					} as any,
				),
			).toEqual('imageCutoutSrc');
		});
		it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageReplace: true,
						imageCutoutReplace: true,
						imageCutoutSrc: 'imageCutoutSrc',
						imageSrc: 'imageSrc',
					},
					{
						...capiArticleWithElementsThumbnail,
						tags: [
							{
								type: 'contributor',
								bylineLargeImageUrl: 'contributorSrc',
							},
						],
						fields: {
							...capiArticleWithElementsThumbnail.fields,
							thumbnail: 'fieldSrc',
							secureThumbnail: 'fieldSrcSecure',
						},
					} as any,
				),
			).toEqual('imageSrc');
		});
		it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
			expect(
				getThumbnail(
					{
						...cardWithSlideshowThumbnailMeta,
						imageReplace: true,
						imageCutoutReplace: true,
						imageCutoutSrc: 'imageCutoutSrc',
						imageSrc: 'imageSrc',
						imageSrcThumb: 'imageSrcThumb',
					},
					{
						...capiArticleWithElementsThumbnail,
						tags: [
							{
								type: 'contributor',
								bylineLargeImageUrl: 'contributorSrc',
							},
						],
						fields: {
							...capiArticleWithElementsThumbnail.fields,
							thumbnail: 'fieldSrc',
							secureThumbnail: 'fieldSrcSecure',
						},
					} as any,
				),
			).toEqual('imageSrcThumb');
		});
	});

	describe('isLive', () => {
		it('should return false for a draft article from preview CAPI and when isLive is a boolean', () => {
			const article = {
				...capiArticleWithElementsThumbnail,
				fields: {
					isLive: false,
				},
			} as CapiArticle;

			expect(article.fields.isLive).toEqual(false);
			expect(isLive(article)).toEqual(false);
		});

		it('should return false for a draft article from preview CAPI and when isLive is a string', () => {
			const article = {
				...capiArticleWithElementsThumbnail,
				fields: {
					isLive: 'false',
				},
			} as CapiArticle;

			expect(article.fields.isLive).toEqual('false');
			expect(isLive(article)).toEqual(false);
		});

		it('should return true for a published article from preview CAPI and when isLive is a boolean', () => {
			const article = {
				...capiArticleWithElementsThumbnail,
				fields: {
					isLive: true,
				},
			} as CapiArticle;

			expect(article.fields.isLive).toEqual(true);
			expect(isLive(article)).toEqual(true);
		});

		it('should return true for a published article from preview CAPI and when isLive is a string', () => {
			const article = {
				...capiArticleWithElementsThumbnail,
				fields: {
					isLive: 'true',
				},
			} as CapiArticle;

			expect(article.fields.isLive).toEqual('true');
			expect(isLive(article)).toEqual(true);
		});

		it('should return true if a CapiArticle comes from live CAPI (denoted by isLive being undefined)', () => {
			const article = {
				...capiArticleWithElementsThumbnail,
				fields: {},
			} as CapiArticle;

			expect(article.fields.isLive).toBeUndefined();
			expect(isLive(article)).toEqual(true);
		});
	});
});
