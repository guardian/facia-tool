import { oc } from 'ts-optchain';
import { Atom, Element } from 'types/Capi';
import { ExternalArticle } from 'types/ExternalArticle';
import { DerivedArticle } from 'types/Article';
import isAfter from 'date-fns/is_after';
import isValid from 'date-fns/is_valid';

export const hasMainVideo = (article: ExternalArticle | DerivedArticle) => {
	return (
		hasMainMediaVideoAtom(article) ||
		getArticleMainElementType(article) === 'video'
	);
};

export const getMainMediaVideoAtom = (
	article: ExternalArticle | DerivedArticle,
): Atom | undefined => {
	const mainBlockElement = oc(article).blocks.main.elements([])[0] || undefined;
	const atomId: string | undefined =
		oc(mainBlockElement).contentAtomTypeData.atomId();
	if (!atomId) {
		return undefined;
	}
	return (
		oc(article)
			.atoms.media([])
			.find((_) => _.id === atomId) || undefined
	);
};

// this function probably refers to old-style video pages which have a main element of type video
export function getArticleMainElementType(
	article: ExternalArticle | DerivedArticle,
) {
	const element = (article.elements || []).find((_) => _.relation === 'main');
	return element ? element.type : undefined;
}

export function hasMainMediaVideoAtom(
	article: ExternalArticle | DerivedArticle,
) {
	const mainBlockElement = oc(article).blocks.main.elements([])[0] || undefined;

	function hasMediaAtomMainMedia(blockElement: Element) {
		return oc(blockElement).contentAtomTypeData.atomType() === 'media';
	}

	function isVideo(blockElement: Element) {
		const atomId: string | undefined =
			oc(blockElement).contentAtomTypeData.atomId();
		if (!atomId) {
			return false;
		}
		const atom =
			oc(article)
				.atoms.media([])
				.find((_) => _.id === atomId) || undefined;
		const firstAsset = oc(atom).data.media.assets([])[0] || undefined;
		return firstAsset && firstAsset.assetType === 'video';
	}

	return (
		typeof mainBlockElement !== 'undefined' &&
		hasMediaAtomMainMedia(mainBlockElement) &&
		isVideo(mainBlockElement)
	);
}

/**
 * Create a selector to answer the question -- is the article last modified field older than the given date?
 * This function is liberal in what it accepts -- if either date is invalid/missing, it returns `true`.
 */
export const createSelectIsArticleStale =
	<State>(
		selectArticleById: (
			state: State,
			id: string,
		) => ExternalArticle | undefined,
	) =>
	(state: State, id: string, dateStr: string | undefined): boolean => {
		const article = selectArticleById(state, id);
		if (!article || !article.fields.lastModified || !dateStr) {
			return true;
		}
		const articleDate = new Date(article.fields.lastModified);
		const incomingDate = new Date(dateStr);
		if (!isValid(articleDate) || !isValid(incomingDate)) {
			return true;
		}
		return isAfter(incomingDate, articleDate);
	};
