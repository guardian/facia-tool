import urlConstants from '../constants/url';

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
  return hostnames.some(_ => _ === host);
}

function isGuardianUrl(url: string) {
  return matchHostname(url, [
    urlConstants.base.mainDomain,
    urlConstants.base.mainDomainShort
  ]);
}

function isInternalUrl(url: string) {
  return matchHostname(url, [
    urlConstants.base.mainDomain,
    urlConstants.base.mainDomainShort,
    urlConstants.base.previewDomain,
    urlConstants.base.frontendDomain
  ]);
}

export {
  getAbsolutePath,
  getHostname,
  isGuardianUrl,
  isInternalUrl,
  isValidURL
};
