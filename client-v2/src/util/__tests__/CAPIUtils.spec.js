// @flow

import { capiArticleWithElementsThumbnail } from 'fixtures/capiArticle';
import {
  articleFragmentWithElementsThumbnail,
  articleFragmentWithSlideshowThumbnail
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
          articleFragmentWithElementsThumbnail,
          capiArticleWithElementsThumbnail
        )
      ).toEqual(
        'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg'
      );
    });
    it('should get a thumbnail from articleFragmentMeta slideshows if imageSlideshowReplace is true', () => {
      expect(
        getThumbnail(
          articleFragmentWithSlideshowThumbnail,
          capiArticleWithElementsThumbnail
        )
      ).toEqual('exampleSrc1');
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageSlideshowReplace: false
            }
          },
          capiArticleWithElementsThumbnail
        )
      ).toEqual(
        'https://media.guim.co.uk/6780f7f6f3dca00e549487d9ca6b7bd1cdbe1556/337_105_1313_788/500.jpg'
      );
    });
    it('should get a thumbnail from the fields thumbnail/secureThumbnail if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageCutoutReplace: true
            }
          },
          {
            ...capiArticleWithElementsThumbnail,
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc'
            }
          }
        )
      ).toEqual('fieldSrc');
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageCutoutReplace: true
            }
          },
          {
            ...capiArticleWithElementsThumbnail,
            fields: {
              ...capiArticleWithElementsThumbnail.fields,
              thumbnail: 'fieldSrc',
              secureThumbnail: 'fieldSrcSecure'
            }
          }
        )
      ).toEqual('fieldSrcSecure');
    });
    it('should get a thumbnail from the contributor image if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageCutoutReplace: true
            }
          },
          {
            ...capiArticleWithElementsThumbnail,
            tags: [
              {
                type: 'contributor',
                bylineLargeImageUrl: 'contributorSrc'
              }
            ]
          }
        )
      ).toEqual('contributorSrc');
    });
    it('should get a thumbnail from the meta cutout if meta.imageCutoutReplace is true', () => {
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageCutoutReplace: true,
              imageCutoutSrc: 'imageCutoutSrc'
            }
          },
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
          }
        )
      ).toEqual('imageCutoutSrc');
    });
    it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageReplace: true,
              imageCutoutReplace: true,
              imageCutoutSrc: 'imageCutoutSrc',
              imageSrc: 'imageSrc'
            }
          },
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
          }
        )
      ).toEqual('imageSrc');
    });
    it('should get a thumbnail from the meta imageSrc if isReplacingImage is true', () => {
      expect(
        getThumbnail(
          {
            ...articleFragmentWithSlideshowThumbnail,
            meta: {
              ...articleFragmentWithSlideshowThumbnail.meta,
              imageReplace: true,
              imageCutoutReplace: true,
              imageCutoutSrc: 'imageCutoutSrc',
              imageSrc: 'imageSrc',
              imageSrcThumb: 'imageSrcThumb'
            }
          },
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
          }
        )
      ).toEqual('imageSrcThumb');
    });
  });
});
