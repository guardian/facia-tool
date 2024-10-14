import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import compact from 'lodash/compact';
import clamp from 'lodash/clamp';
import pickBy from 'lodash/pickBy';
import { isDirty } from 'redux-form';
import pageConfig from 'util/extractConfigFromPage';
import { CardMeta, ImageData } from 'types/Collection';
import { DerivedArticle } from 'types/Article';
import { CapiArticle } from 'types/Capi';
import type { State } from 'types/State';
import { selectCard } from 'selectors/shared';

export interface CardFormData {
	headline: string;
	isBoosted: boolean;
	boostLevel: string;
	showQuotedHeadline: boolean;
	showLargeHeadline: boolean;
	customKicker: string;
	pickedKicker: string;
	isBreaking: boolean;
	showLivePlayable: boolean;
	byline: string;
	sportScore: string;
	showByline: boolean;
	trailText: string;
	imageHide: boolean;
	primaryImage: ImageData;
	cutoutImage: ImageData;
	imageCutoutReplace: boolean;
	imageCutoutSrc: string;
	imageSlideshowReplace: boolean;
	slideshow: Array<ImageData | void> | void;
	showKickerTag: boolean;
	showKickerSection: boolean;
	imageReplace: boolean;
	overrideArticleMainMedia: boolean;
	showMainVideo: boolean;
	coverCardImageReplace: boolean;
	coverCardMobileImage: ImageData;
	coverCardTabletImage: ImageData;
}

export type FormFields = keyof CardFormData;

export interface CapiFields {
	headline: string;
	trailText: string;
	byline: string;
	thumbnail?: string | void;
}

export const strToInt = (str: string | void) =>
	str ? parseInt(str, 10) : undefined;
export const intToStr = (int: number | void) =>
	int ? int.toString() : undefined;

export const getCapiValuesForArticleFields = (
	article: CapiArticle | void,
): CapiFields => {
	if (!article) {
		return {
			headline: '',
			trailText: '',
			byline: '',
			thumbnail: '',
		};
	}
	return {
		headline: article.fields.headline || '',
		trailText: article.fields.trailText || '',
		byline: article.fields.byline || '',
		thumbnail: article.fields.thumbnail,
	};
};

const tenImagesFeatureSwitch = pageConfig?.userData?.featureSwitches.find(
	(feature) => feature.key === 'ten-image-slideshows',
);

export const maxSlideshowImages = tenImagesFeatureSwitch?.enabled ? 10 : 5;

export const getInitialValuesForCardForm = (
	article: DerivedArticle | void,
): CardFormData | void => {
	if (!article) {
		return undefined;
	}
	const slideshowBackfill: Array<ImageData | void> = [];
	const slideshow: Array<ImageData | void> = (article.slideshow || []).map(
		(image) => ({
			...image,
			width: strToInt(image.width),
			height: strToInt(image.height),
		}),
	);
	slideshowBackfill.length = clamp(
		maxSlideshowImages - slideshow.length,
		0,
		maxSlideshowImages,
	);
	slideshowBackfill.fill(undefined);
	return article
		? {
				headline: article.headline || '',
				isBoosted: article.isBoosted || false,
				boostLevel: article.boostLevel || 'default',
				showQuotedHeadline: article.showQuotedHeadline || false,
				showLargeHeadline: article.showLargeHeadline || false,
				showKickerTag: article.showKickerTag || false,
				showKickerSection: article.showKickerSection || false,
				customKicker: article.customKicker || '',
				pickedKicker: article.pickedKicker || '',
				isBreaking: article.isBreaking || false,
				showLivePlayable: article.showLivePlayable || false,
				byline: article.byline || '',
				showByline: article.showByline || false,
				trailText: article.trailText || '',
				imageCutoutReplace: article.imageCutoutReplace || false,
				imageCutoutSrc: article.imageCutoutSrc || '',
				imageHide: article.imageHide || false,
				imageReplace: article.imageReplace || false,
				imageSlideshowReplace: article.imageSlideshowReplace || false,
				primaryImage: {
					src: article.imageSrc,
					width: strToInt(article.imageSrcWidth),
					height: strToInt(article.imageSrcHeight),
					origin: article.imageSrcOrigin,
					thumb: article.imageSrcThumb,
				},
				cutoutImage: {
					src: article.imageCutoutSrc,
					width: strToInt(article.imageCutoutSrcWidth),
					height: strToInt(article.imageCutoutSrcHeight),
					origin: article.imageCutoutSrcOrigin,
					thumb: article.imageCutoutSrc,
				},
				slideshow: slideshow.concat(slideshowBackfill),
				overrideArticleMainMedia: article.overrideArticleMainMedia || false,
				sportScore: article.sportScore || '',
				showMainVideo: !!article.showMainVideo,
				coverCardImageReplace: article.coverCardImageReplace || false,
				coverCardMobileImage: article.coverCardMobileImage || {},
				coverCardTabletImage: article.coverCardTabletImage || {},
			}
		: undefined;
};

// Because multiple fields in the article meta map to
// a single field in the form, we need a way to map between
// the two models to figure out which meta fields should be
// added to the form output when a form field is dirtied.
const formToMetaFieldMap: { [fieldName: string]: string } = {
	imageSrc: 'primaryImage',
	imageSrcThumb: 'primaryImage',
	imageSrcWidth: 'primaryImage',
	imageSrcHeight: 'primaryImage',
	imageSrcOrigin: 'primaryImage',
	imageCutoutSrc: 'cutoutImage',
	imageCutoutSrcWidth: 'cutoutImage',
	imageCutoutSrcHeight: 'cutoutImage',
	imageCutoutSrcOrigin: 'cutoutImage',
};

export const getImageMetaFromValidationResponse = (image: ImageData) => ({
	imageSrc: image.src,
	imageSrcThumb: image.thumb,
	imageSrcWidth: intToStr(image.width),
	imageSrcHeight: intToStr(image.height),
	imageSrcOrigin: image.origin,
});

export const getCardMetaFromFormValues = (
	state: State,
	id: string,
	values: CardFormData,
): CardMeta => {
	const primaryImage = values.primaryImage || {};
	const cutoutImage = values.cutoutImage || {};
	const slideshow = compact(values.slideshow as ImageData[]).map(
		(image: ImageData) => ({
			...image,
			width: intToStr(image.width),
			height: intToStr(image.height),
		}),
	);
	const getStringField = (field: string) => {
		if (field.length === 0) {
			return undefined;
		}
		return field;
	};

	const completeMeta = omit(
		{
			...values,
			headline: getStringField(values.headline),
			trailText: getStringField(values.trailText),
			byline: getStringField(values.byline),
			sportScore: getStringField(values.sportScore),
			...getImageMetaFromValidationResponse(primaryImage),
			imageCutoutSrc: cutoutImage.src,
			imageCutoutSrcWidth: intToStr(cutoutImage.width),
			imageCutoutSrcHeight: intToStr(cutoutImage.height),
			imageCutoutSrcOrigin: cutoutImage.origin,
			slideshow: slideshow.length ? slideshow : undefined,
		},
		'primaryImage',
		'cutoutImage',
	);

	// We only return dirtied values.
	const selectIsDirty = isDirty(id);
	const dirtiedFields = pickBy(completeMeta, (_, key) => {
		return selectIsDirty(state, formToMetaFieldMap[key] || key);
	});

	const existingCard = selectCard(state, id);

	const existingCardMeta = existingCard ? existingCard.meta || {} : {};

	let newCardMeta = {
		...existingCardMeta,
		...dirtiedFields,
	};

	if (!values.customKicker) {
		newCardMeta = omit(newCardMeta, 'showKickerCustom');
	}

	return omitBy(newCardMeta, (value: string | boolean | any[]) => {
		if (Array.isArray(value)) {
			return value.length === 0;
		}
		return value === undefined;
	});
};

export const shouldRenderField = (
	name: string | string[],
	permittedNames?: string[],
) => {
	const names = Array.isArray(name) ? name : [name];
	for (const nameIndex in names) {
		if (!permittedNames || permittedNames.indexOf(names[nameIndex]) !== -1) {
			return true;
		}
	}
	return null;
};
