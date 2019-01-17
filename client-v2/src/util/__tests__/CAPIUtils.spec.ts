import { capiArticleWithElementsThumbnail } from 'fixtures/capiArticle';
import {
  articleFragmentMeta,
  articleFragmentWithSlideshowThumbnailMeta
} from 'fixtures/articleFragment';
import {
  getIdFromURL,
  getContributorImage,
  getThumbnail
} from 'util/CAPIUtils';

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
  });

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
        getThumbnail(capiArticleWithElementsThumbnail, articleFragmentMeta)
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
        getThumbnail(capiArticleWithElementsThumbnail, {
          ...articleFragmentWithSlideshowThumbnailMeta,
          imageSlideshowReplace: false
        })
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
          } as any,
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true
          }
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
          } as any,
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc'
          }
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
          } as any,
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageReplace: true,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc',
            imageSrc: 'imageSrc'
          }
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
          } as any,
          {
            ...articleFragmentWithSlideshowThumbnailMeta,
            imageReplace: true,
            imageCutoutReplace: true,
            imageCutoutSrc: 'imageCutoutSrc',
            imageSrc: 'imageSrc',
            imageSrcThumb: 'imageSrcThumb'
          }
        )
      ).toEqual('imageSrcThumb');
    });
  });
});
