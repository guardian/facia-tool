import urlConstants from 'constants/url';
import { CardMeta } from 'types/Collection';

const a = document.createElement('a');

/*
 * Gets the absolute path of a url.
 */
function getAbsolutePath(url: string, keepQueryString?: boolean) {
	// If necessary, add a leading slash to stop the browser resolving it against the current path
	url = url.match(/^\//) || url.match(/^https?:\/\//) ? url : '/' + url;
	a.href = url;
	const path = a.pathname.replace(/^\//, '');

	// Return the abspath without a leading slash, because ContentApi ids are formed like that
	return keepQueryString ? path + a.search : path;
}

/**
 * Get the hostname of a url.
 */
function getHostname(url: string) {
	a.href = url;
	return a.hostname;
}

function isValidURL(url: string) {
	return getHostname(url) !== window.location.hostname;
}

function matchHostname(url: string, hostnames: string[]): boolean {
	const host = getHostname(url);
	return hostnames.some((_) => _ === host);
}

function isGuardianWebsiteUrl(url: string) {
	return matchHostname(url, [
		urlConstants.base.mainDomain,
		urlConstants.base.mainDomainShort,
	]);
}

function isGuardianUrl(url: string) {
	return matchHostname(url, [
		urlConstants.base.mainDomain,
		urlConstants.base.mainDomainShort,
		urlConstants.base.previewDomain,
		urlConstants.base.frontendDomain,
		urlConstants.base.shortDomain,
	]);
}

// eg: hits a capi endpoint https://content.guardianapis.com/atom/interactive/interactives/2017/06/general-election
function isCapiUrl(url: string) {
	return matchHostname(url, [urlConstants.base.capi]);
}

/**
 * Given a URL, identify whether it has been provided as Google redirect URL,
 * e.g. https://www.google.com/url?q=https://example.com/foobar&sa=D&source=hangouts&ust=someId&usg=anotherId
 * This can happen as a result of a URL being copied from Google Hangouts
 */
const isGoogleRedirectUrl = (url: string) => {
	a.href = url;
	return a.hostname.includes('google') && hasWhitelistedParams(url, ['q']);
};

const getRelevantURLFromGoogleRedirectURL = (url: string) => {
	const params = checkQueryParams(url, ['q']);
	if (params && isValidURL(params[0][1])) {
		return params[0][1];
	}
	return url;
};

const checkQueryParams = (url: string, whiteList: string[]) => {
	let urlObj: URL | undefined;
	try {
		urlObj = new URL(url);
	} catch (e) {
		// This wasn't a valid URL -- we won't be able to extract values.
		return undefined;
	}
	const allParams = Array.from(urlObj.searchParams);
	return allParams.filter(([key]) => whiteList.includes(key));
};

const hasWhitelistedParams = (url: string, whiteList: string[]) => {
	const validParams = checkQueryParams(url, whiteList);
	return validParams && validParams.length > 0;
};

const guPrefix = 'gu-';

/**
 * Given a URL, produce an object with the appropriate meta values.
 */
const getCardMetaFromUrlParams = (
	url: string,
	whitelist: [],
): CardMeta | undefined => {
	const guParams = checkQueryParams(url, whitelist);
	return (
		guParams &&
		guParams.reduce(
			(acc, [key, value]) => ({ ...acc, [key.replace(guPrefix, '')]: value }),
			{},
		)
	);
};

const isValidSnapLinkUrl = (maybeLink: string) => {
	try {
		const url = new URL(maybeLink);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch (e) {
		return false;
	}
};

export {
	getAbsolutePath,
	getHostname,
	isGuardianWebsiteUrl,
	isGuardianUrl,
	isValidURL,
	isCapiUrl,
	isGoogleRedirectUrl,
	getRelevantURLFromGoogleRedirectURL,
	checkQueryParams,
	hasWhitelistedParams,
	getCardMetaFromUrlParams,
	isValidSnapLinkUrl,
};
