const a = document.createElement('a');

/*
 * Gets the absolute path of a string.
 */
function getAbsolutePath(url: string, keepQueryString?: boolean) {
  // If necessary, add a leading slash to stop the browser resolving it against the current path
  url = url.match(/^\//) || url.match(/^https?:\/\//) ? url : '/' + url;
  a.href = url;
  const path = a.pathname.replace(/^\//, '');

  // Return the abspath without a leading slash, because ContentApi ids are formed like that
  return keepQueryString ? path + a.search : path;
}

export { getAbsolutePath };
