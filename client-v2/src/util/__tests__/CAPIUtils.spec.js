// @flow

import { capiArticleWithElementsThumbnail } from 'fixtures/capiArticle';
import {
  articleFragmentWithElementsThumbnailMeta,
  articleFragmentWithSlideshowThumbnailMeta
} from 'fixtures/articleFragment';
import { getContributorImage, getThumbnail } from 'util/CAPIUtils';

describe('CAPIUtils', () => {
  describe('getContributorImage', () => {
    it('should get a contributor image from an external article', () => {
      expect(getContributorImage(capiArticleWithElementsThumbnail)).toEqual(
        undefined
      );
    });
  });
  describe('getThumbnail', () => {
    it('should get a thumbnail from article elements', () => {
      expect(
        getThumbnail(
          capiArticleWithElementsThumbnail,
          articleFragmentWithElementsThumbnailMeta
        )
      ).toEqual(
        'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg'
      );
    });
    it('should get a thumbnail from articleFragmentMeta slideshows if imageSlideshowReplace is true', () => {
      expect(
        getThumbnail(
          capiArticleWithElementsThumbnail,
          articleFragmentWithSlideshowThumbnailMeta
        )
      ).toEqual('exampleSrc1');
      expect(
        getThumbnail(
          capiArticleWithElementsThumbnail,
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageSlideshowReplace: false
          },
        )
      ).toEqual(
        'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg'
      );
    });
    it('should get a thumbnail from the fields thumbnail/secureThumbnail if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc'
            }
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true
          }
        )
      ).toEqual('fieldSrc');
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc',
              secureThumbnail: 'fieldSrcSecure'
            }
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true
          }
        )
      ).toEqual('fieldSrcSecure');
    });
    it('should get a thumbnail from the contributor image if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            tags: [
              {
                type: 'contributor',
                bylineLargeImageUrl: 'contributorSrc'
              }
            ]
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true
          },
        )
      ).toEqual('contributorSrc');
    });
    it('should get a thumbnail from the meta cutout if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            tags: [
              {
                type: 'contributor',
                bylineLargeImageUrl: 'contributorSrc'
              }
            ],
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc',
              secureThumbnail: 'fieldSrcSecure'
            }
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc'
          },
        )
      ).toEqual('imageCutoutSrc');
    });
    it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            tags: [
              {
                type: 'contributor',
                bylineLargeImageUrl: 'contributorSrc'
              }
            ],
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc',
              secureThumbnail: 'fieldSrcSecure'
            }
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageReplace: true,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc',
            imageSrc: 'imageSrc'
          },
        )
      ).toEqual('imageSrc');
    });
    it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
      expect(
        getThumbnail(
          {
            ...capiArticleWithElementsThumbnail,
            tags: [
              {
                type: 'contributor',
                bylineLargeImageUrl: 'contributorSrc'
              }
            ],
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc',
              secureThumbnail: 'fieldSrcSecure'
            }
          },
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageReplace: true,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc',
            imageSrc: 'imageSrc',
            imageSrcThumb: 'imageSrcThumb'
          },
        )
      ).toEqual('imageSrcThumb');
    });
  });
});
