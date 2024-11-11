import { cloneActiveImageMeta } from 'util/card';
import { CardMeta } from 'types/Collection';

const createCard = (meta: CardMeta = {}) => ({
	id: 'id',
	uuid: 'uuid',
	frontPublicationDate: 123,
	meta,
});

describe('card utils', () => {
	describe('cloneActiveImageMeta', () => {
		it('should do nothing if the article has no meta', () => {
			expect(cloneActiveImageMeta(createCard())).toEqual({});
		});
		it('should replace images and enable them', () => {
			expect(
				cloneActiveImageMeta(
					createCard({
						imageReplace: true,
						imageSrc: 'image',
						imageSrcThumb: 'image',
						imageSrcWidth: 'image',
						imageSrcHeight: 'image',
						imageSrcOrigin: 'image',
					}),
				),
			).toEqual({
				imageReplace: true,
				imageCutoutReplace: false,
				imageSlideshowReplace: false,
				imageSrc: 'image',
				imageSrcThumb: 'image',
				imageSrcWidth: 'image',
				imageSrcHeight: 'image',
				imageSrcOrigin: 'image',
			});
		});
		it('should replace cutouts and enable them', () => {
			expect(
				cloneActiveImageMeta(
					createCard({
						imageCutoutReplace: true,
						imageCutoutSrc: 'image',
						imageCutoutSrcWidth: 'image',
						imageCutoutSrcHeight: 'image',
						imageCutoutSrcOrigin: 'image',
					}),
				),
			).toEqual({
				imageCutoutReplace: true,
				imageReplace: false,
				imageSlideshowReplace: false,
				imageCutoutSrc: 'image',
				imageCutoutSrcWidth: 'image',
				imageCutoutSrcHeight: 'image',
				imageCutoutSrcOrigin: 'image',
			});
		});
		it('should replace slideshows and enable them', () => {
			expect(
				cloneActiveImageMeta(
					createCard({
						imageSlideshowReplace: true,
						slideshow: [
							{
								src: 'slideshow',
								thumb: 'slideshow',
								width: 'slideshow',
								height: 'slideshow',
								origin: 'slideshow',
							},
						],
					}),
				),
			).toEqual({
				imageSlideshowReplace: true,
				imageReplace: false,
				imageCutoutReplace: false,
				slideshow: [
					{
						src: 'slideshow',
						thumb: 'slideshow',
						width: 'slideshow',
						height: 'slideshow',
						origin: 'slideshow',
					},
				],
			});
		});
		it('should not replace both images and slideshows', () => {
			expect(
				cloneActiveImageMeta(
					createCard({
						// This card has both the image and the slideshow enabled,
						// which is invalid
						imageReplace: true,
						imageSrc: 'image',
						imageSrcWidth: 'image',
						imageSrcHeight: 'image',
						imageSrcOrigin: 'image',
						imageSlideshowReplace: true,
						slideshow: [
							{
								src: 'slideshow',
								thumb: 'slideshow',
								width: 'slideshow',
								height: 'slideshow',
								origin: 'slideshow',
							},
						],
					}),
				),
			).toEqual({
				imageReplace: true,
				imageCutoutReplace: false,
				imageSlideshowReplace: false,
				imageSrc: 'image',
				imageSrcWidth: 'image',
				imageSrcHeight: 'image',
				imageSrcOrigin: 'image',
			});
		});
	});
});
