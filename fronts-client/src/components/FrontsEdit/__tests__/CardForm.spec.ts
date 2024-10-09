import { reducer, initialize, change } from 'redux-form';
import {
  getCardMetaFromFormValues,
  getInitialValuesForCardForm,
  maxSlideshowImages,
} from 'util/form';
import derivedArticle from 'fixtures/derivedArticle';
import { state as initialState } from 'fixtures/initialState';
import type { State } from 'types/State';

const formValues = {
  overrideArticleMainMedia: false,
  byline: 'Caroline Davies',
  customKicker: '',
  cutoutImage: {
    height: undefined,
    origin: undefined,
    src: 'somewhere',
    thumb: 'somewhere',
    width: undefined,
  },
  headline: "Sister of academic's killer warned police he was mentally ill",
  imageCutoutReplace: false,
  imageCutoutSrc: 'somewhere',
  imageHide: false,
  imageReplace: false,
  imageSlideshowReplace: false,
  isBoosted: false,
  boostLevel: 'default',
  isBreaking: false,
  showLivePlayable: false,
  primaryImage: {
    height: undefined,
    origin: undefined,
    src: undefined,
    thumb: undefined,
    width: undefined,
  },
  showLargeHeadline: false,
  showByline: false,
  showQuotedHeadline: false,
  slideshow: Array(maxSlideshowImages).fill(undefined),
  showKickerTag: false,
  showKickerSection: false,
  trailText:
    'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him',
  sportScore: '',
  showMainVideo: false,
  coverCardImageReplace: false,
  coverCardMobileImage: {},
  coverCardTabletImage: {},
  pickedKicker: 'kick',
};

const createStateWithChangedFormFields = (
  cleanState: State,
  articleId: string,
  fieldValueMap: { [field: string]: any },
  additionalFormValues: any = {}
) => {
  const formState = reducer(
    undefined,
    initialize(articleId, { formValues, ...additionalFormValues })
  );
  return {
    ...cleanState,
    form: Object.keys(fieldValueMap).reduce(
      (acc, key) => reducer(acc, change(articleId, key, fieldValueMap[key])),
      formState
    ),
  };
};

describe('CardForm transform functions', () => {
  describe('Derive form values from a derived article', () => {
    it('should derive values', () => {
      expect(getInitialValuesForCardForm(derivedArticle, null)).toEqual(
        formValues
      );
    });
    it('should handle existing slideshows of any length', () => {
      const exampleImage = {
        src: 'src',
        width: 100,
        height: 100,
        origin: 'origin',
        thumb: 'thumb',
      };
      const slideshow = Array(maxSlideshowImages + 5).fill(exampleImage);
      const slideshowArticle = {
        ...derivedArticle,
        slideshow,
      };
      expect(getInitialValuesForCardForm(slideshowArticle, null)).toEqual({
        ...formValues,
        slideshow,
      });
    });
    it('should get number values for all image widths and heights', () => {
      expect(
        getInitialValuesForCardForm(
          {
            ...derivedArticle,
            boostLevel: 'megaboost',
            imageSrc: 'exampleSrc1',
            imageSrcHeight: '100',
            imageSrcWidth: '100',
            imageSrcOrigin: 'exampleOrigin',
            imageSrcThumb: 'exampleThumb',
            imageCutoutSrc: 'exampleSrc2',
            imageCutoutSrcHeight: '200',
            imageCutoutSrcWidth: '200',
            imageCutoutSrcOrigin: 'exampleOrigin',
            slideshow: [
              {
                src: 'exampleSrc3',
                height: '300',
                width: '300',
                thumb: 'exampleThumb',
                origin: 'exampleOrigin',
              },
              {
                src: 'exampleSrc4',
                height: '400',
                width: '400',
                thumb: 'exampleThumb',
                origin: 'exampleOrigin',
              },
            ],
          },
          null
        )
      ).toEqual({
        ...formValues,
        boostLevel: 'megaboost',
        imageCutoutSrc: 'exampleSrc2',
        primaryImage: {
          src: 'exampleSrc1',
          width: 100,
          height: 100,
          origin: 'exampleOrigin',
          thumb: 'exampleThumb',
        },
        cutoutImage: {
          src: 'exampleSrc2',
          width: 200,
          height: 200,
          origin: 'exampleOrigin',
          thumb: 'exampleSrc2',
        },
        slideshow: [
          {
            src: 'exampleSrc3',
            width: 300,
            height: 300,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
          {
            src: 'exampleSrc4',
            width: 400,
            height: 400,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
          ...Array(maxSlideshowImages - 2).fill(undefined),
        ],
      });
    });
  });
  describe('Derive card meta from form values', () => {
    it('should return existing meta if no form values were dirtied', () => {
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        {}
      );
      expect(getCardMetaFromFormValues(state, 'exampleId', formValues)).toEqual(
        { headline: 'Bill Shorten' }
      );
    });
    it('should derive values, removing the slideshow array if empty', () => {
      const byline = 'Caroline Davies edited';
      const headline =
        "Sister of academic's killer warned police he was mentally ill edited";
      const trailText =
        'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him edited';
      const pickedKicker = 'kick';
      const boostLevel = 'gigaboost';
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        {
          byline,
          headline,
          trailText,
          pickedKicker,
          boostLevel,
        }
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          byline,
          headline,
          trailText,
          boostLevel,
        })
      ).toEqual({
        byline: 'Caroline Davies edited',
        headline:
          "Sister of academic's killer warned police he was mentally ill edited",
        trailText:
          'Police noted concerns over Femi Nandap, who went on to stab lecturer, but released him edited',
        pickedKicker: 'kick',
        boostLevel: 'gigaboost',
      });
    });
    it('should derive values, setting the imageReplace value if necessary', () => {
      const values = {
        primaryImage: {
          src: 'exampleSrc',
          width: 100,
          height: 100,
          origin: 'exampleOrigin',
          thumb: 'exampleThumb',
        },
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values,
        })
      ).toEqual({
        imageSrc: 'exampleSrc',
        imageSrcHeight: '100',
        imageSrcOrigin: 'exampleOrigin',
        imageSrcThumb: 'exampleThumb',
        imageSrcWidth: '100',
        headline: 'Bill Shorten',
      });
    });
    it('should remove customKicker and showKickerCustom if the kicker is empty', () => {
      const values = {
        customKicker: '',
        showKickerCustom: true,
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values,
        })
      ).toEqual({ headline: 'Bill Shorten' });
    });
    it('should handle conversion of string values for images', () => {
      const values = {
        primaryImage: {
          src: 'exampleSrc',
          width: 100,
          height: 100,
          origin: 'exampleOrigin',
          thumb: 'exampleThumb',
        },
        slideshow: [
          {
            src: 'exampleSrc',
            width: 100,
            height: 100,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
          {
            src: 'exampleSrc',
            width: 100,
            height: 100,
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
        ],
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values,
        })
      ).toEqual({
        headline: 'Bill Shorten',
        imageSrc: 'exampleSrc',
        imageSrcHeight: '100',
        imageSrcOrigin: 'exampleOrigin',
        imageSrcThumb: 'exampleThumb',
        imageSrcWidth: '100',
        slideshow: [
          {
            src: 'exampleSrc',
            width: '100',
            height: '100',
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
          {
            src: 'exampleSrc',
            width: '100',
            height: '100',
            origin: 'exampleOrigin',
            thumb: 'exampleThumb',
          },
        ],
      });
    });
    it('should remove undefined values from the meta', () => {
      const values = {
        showQuotedHeadline: undefined,
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values,
        } as any)
      ).toEqual({ headline: 'Bill Shorten' });
    });
    it('should keep false values', () => {
      const values = {
        showQuotedHeadline: false,
      };
      const state = createStateWithChangedFormFields(
        initialState,
        'exampleId',
        values,
        { showQuotedHeadline: true }
      );
      expect(
        getCardMetaFromFormValues(state, 'exampleId', {
          ...formValues,
          ...values,
        })
      ).toEqual({ showQuotedHeadline: false, headline: 'Bill Shorten' });
    });
  });
});
