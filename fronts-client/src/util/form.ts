import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import compact from 'lodash/compact';
import clamp from 'lodash/clamp';
import pickBy from 'lodash/pickBy';
import { isDirty } from 'redux-form';
import { CardMeta, ImageData, Test, VariantId } from 'types/Collection';
import { DerivedArticle } from 'types/Article';
import { Atom, CapiArticle } from 'types/Capi';
import type { State } from 'types/State';
import { selectCard } from 'selectors/shared';
import { findActiveOrDraftTest } from './abTests';
import { selectFrontsWithCollection } from 'selectors/frontsSelectors';
import { selectUserFullName, selectUserEmail } from 'selectors/configSelectors';
import v4 from 'uuid/v4';

export interface CardFormData {
	headline: string;
	abTestEnabled: boolean;
	headlineA: string;
	headlineB: string;
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
	isImmersive: boolean;
	videoReplace: boolean;
	replaceVideoUri: string;
	atomId: string;
	replacementVideoAtom: Atom | string;
}

export type FormFields = keyof CardFormData;

export interface CapiFields {
	headline: string;
	trailText: string;
	byline: string;
	thumbnail?: string | void;
	urlPath: string;
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
			urlPath: '',
		};
	}
	return {
		headline: article.fields.headline || '',
		trailText: article.fields.trailText || '',
		byline: article.fields.byline || '',
		thumbnail: article.fields.thumbnail,
		urlPath: article.urlPath,
	};
};

export const maxSlideshowImages = 10;

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
				abTestEnabled: article.abTestEnabled || false,
				headlineA: article.headlineA || '',
				headlineB: article.headlineB || '',
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
				videoReplace: article.videoReplace || false,
				replaceVideoUri: article.replaceVideoUri || '',
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
				isImmersive: article.isImmersive || false,
				atomId: article.atomId || '',
				replacementVideoAtom: article.replacementVideoAtom || '',
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

export const getCardTestFromFormValues = (
	state: State,
	id: string,
	values: CardFormData,
): Test | undefined => {
	const { headlineA, headlineB, abTestEnabled } = values;

	const existingCard = selectCard(state, id);
	const maybeTest = findActiveOrDraftTest(existingCard);

	const hasNoTestToSave = !maybeTest && !abTestEnabled;

	if (hasNoTestToSave) {
		return undefined;
	}

	const headlineByVariantId: Record<VariantId, string> = {
		A: headlineA,
		B: headlineB,
	};

	if (maybeTest) {
		const updatedVariantMeta = maybeTest.variantMeta.map((variant) => {
			const headlineVariant = headlineByVariantId[variant.id];
			return {
				...variant,
				meta: {
					...variant.meta,
					headline: getStringField(headlineVariant),
				},
			};
		});

		// When the "Headline test" toggle is switched off, end the test on this
		// trail and record who ended it
		const hasManuallyEndedOnThisTrail = !abTestEnabled;

		return {
			...maybeTest,
			variantMeta: updatedVariantMeta,
			hasManuallyEndedOnThisTrail,
			manuallyEndedOnThisTrailByName: hasManuallyEndedOnThisTrail
				? selectUserFullName(state)
				: undefined,
			manuallyEndedOnThisTrailByEmail: hasManuallyEndedOnThisTrail
				? selectUserEmail(state) || ''
				: undefined,
		};
	}

	return {
		testUuid: v4(),
		variantMeta: [
			{
				id: 'A',
				meta: {
					headline: getStringField(headlineByVariantId.A),
				},
			},
			{
				id: 'B',
				meta: {
					headline: getStringField(headlineByVariantId.B),
				},
			},
		],
		createdByName: selectUserFullName(state),
		createdByEmail: selectUserEmail(state) || '',
		hasManuallyEndedOnThisTrail: !abTestEnabled,
		frontsThisTestCanRunOn: selectFrontsWithCollection(
			state,
			existingCard.uuid,
		),
	};
};

const getStringField = (field: string) => {
	if (field.length === 0) {
		return undefined;
	}
	return field;
};

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
		'headlineA',
		'headlineB',
		'abTestEnabled',
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

	// When A/B testing is switched off (and card is saved), clear the variant headlines
	if (!values.abTestEnabled) {
		newCardMeta = omit(newCardMeta, 'headlineA', 'headlineB');
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
