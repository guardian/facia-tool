import urlConstants from '../constants/url';
import { ArticleFragment } from '../types/Collection';
import { DerivedArticle } from '../types/Article';
import { ExternalArticle } from '../types/ExternalArticle';

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
 * Get the complete viewable URL for an article.
 */
export function getViewUrl(article: DerivedArticle) {
  let url;
  if (article.isLive === false) {
    url =
      'https://' +
      urlConstants.base.previewDomain +
      '/' +
      getAbsolutePath(article.webUrl);
  } else {
    url = article.href || article.webUrl;

    if (url && !/^https?:\/\//.test(url)) {
      url = 'https://' + urlConstants.base.mainDomain + url;
    }
  }

  return url;
}

/**
 * Get the hostname of a url.
 */
function getHostname(url: string) {
  a.href = url;
  return a.hostname;
}

function isValidURL(url: string) {
  return getHostname(url) !== window.location.host;
}

function isGuardianUrl(url: string) {
  const host = getHostname(url);
  return (
    host === urlConstants.base.mainDomain ||
    host === urlConstants.base.mainDomainShort
  );
}

function isPreviewUrl(url: string) {
  return getHostname(url) === urlConstants.base.previewDomain;
}

export {
  getAbsolutePath,
  getHostname,
  isGuardianUrl,
  isPreviewUrl,
  isValidURL
};
