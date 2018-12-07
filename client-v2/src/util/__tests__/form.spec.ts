import { getInitialValuesForArticleFragmentForm } from '../form';
import derivedArticle from 'fixtures/derivedArticle';

const initialFormValues = {
  headline: derivedArticle.headline,
  isBoosted: false,
  showQuotedHeadline: false,
  showBoostedHeadline: false,
  customKicker: '',
  isBreaking: false,
  byline: derivedArticle.byline,
  showByline: false,
  trailText: derivedArticle.trailText,
  imageCutoutReplace: false,
  imageHide: false,
  imageSlideshowReplace: false,
  primaryImage: {
    src: undefined,
    width: undefined,
    height: undefined,
    origin: undefined,
    thumb: undefined,
  },
  cutoutImage: {
    src: undefined,
    width: undefined,
    height: undefined,
    origin: undefined,
  },
  slideshow: [undefined, undefined, undefined, undefined]
}

describe('Form utils', () => {
  describe('getInitialValuesForArticleFragmentForm', () => {
    it('get form values from a derived article, backfilling a slideshow', () => {
      expect(getInitialValuesForArticleFragmentForm(derivedArticle)).toEqual(initialFormValues)
    });
    it('should handle existing slideshows of any length', () => {
      const exampleImage = {
        src: 'src',
        width: 100,
        height: 100,
        origin: 'origin',
        thumb: 'thumb'
      }
      const slideshow = Array(5).fill(exampleImage);
      const slideshowArticle = {
        ...derivedArticle,
        slideshow
      }
      expect(getInitialValuesForArticleFragmentForm(slideshowArticle)).toEqual({
        ...initialFormValues,
        slideshow
      })
    });
  });
});
